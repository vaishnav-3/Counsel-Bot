import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { messages } from "@/db/schema";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface AIResponse {
  title: string;
  response: string;
}

/**
 * Parse JSON response from Gemini, with fallback handling
 */
function parseAIResponse(text: string): AIResponse {
  try {
    // Try to find JSON in the response (sometimes Gemini wraps it in markdown)
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
    
    const parsed = JSON.parse(jsonText);
    
    // Validate the structure
    if (typeof parsed.title === 'string' && typeof parsed.response === 'string') {
      return {
        title: parsed.title.trim(),
        response: parsed.response.trim()
      };
    } else {
      throw new Error('Invalid JSON structure');
    }
  } catch (error) {
    console.warn('Failed to parse AI response as JSON:', error);
    
    // Fallback: try to extract title and response manually
    const lines = text.split('\n');
    let title = 'Career Discussion';
    let response = text;
    
    // Look for common title patterns
    const titleMatch = text.match(/(?:title|subject|topic):\s*([^\n]+)/i) ||
                      text.match(/^#\s*([^\n]+)/m) ||
                      text.match(/^(.{5,50})\n/);
    
    if (titleMatch) {
      title = titleMatch[1].trim();
      response = text.replace(titleMatch[0], '').trim();
    } else {
      // Generate title from first sentence or first 50 characters
      const firstSentence = text.match(/^([^.!?]+[.!?])/);
      if (firstSentence) {
        title = firstSentence[1].trim();
        if (title.length > 50) {
          title = title.substring(0, 47) + '...';
        }
      } else {
        title = text.substring(0, 47) + (text.length > 47 ? '...' : '');
      }
    }
    
    return { title, response };
  }
}

/**
 * Get career counseling answer and title from Gemini AI in a single call
 */
export async function getCareerCounselingAnswer(
  message: string,
  sessionHistory: ChatMessage[] = []
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

  try {
    // Create system prompt for career counseling with JSON response requirement
    const systemPrompt = `
You are a **professional Career Counselor** with extensive experience in guiding people through their career development journey.

**EXTREMELY IMPORTANT - OUTPUT FORMAT:**
You MUST ALWAYS respond with ONLY a valid JSON object. Do not include any text before or after the JSON. The format is:

{
  "title": "Brief descriptive title (max 60 chars)",
  "response": "Your detailed markdown response here"
}

**JSON Requirements:**
- Start your response with { and end with }
- No text outside the JSON object
- Use proper JSON escaping for quotes and newlines
- Title should be 5-60 characters
- Response should contain your full career advice with markdown

**Career Counseling Guidelines:**
1. **Personalized Advice**: Tailor suggestions to user's background and goals
2. **Structured Response**: Use markdown formatting (##, -, **, etc.)
3. **Actionable Steps**: Provide clear next steps and resources
4. **Supportive Tone**: Be encouraging yet realistic
5. **Areas to Cover**: Career transitions, skills, job search, interviews, growth

**Example Response (copy this exact format):**
{
  "title": "Software Developer Career Switch",
  "response": "## Making the Switch to Software Development\\n\\n**Great choice!** Transitioning to tech is very achievable.\\n\\n### Key Steps:\\n\\n1. **Learn fundamentals** - Start with HTML, CSS, JavaScript\\n2. **Build projects** - Create a portfolio on GitHub\\n3. **Practice coding** - Use platforms like LeetCode\\n\\n**Next Actions:**\\n- Choose a programming language\\n- Set a 6-month learning timeline\\n- Join developer communities\\n\\n*Remember: Consistency beats intensity in learning to code!*"
}

Remember: ONLY respond with the JSON object. No other text.`;

    // Convert session history to Gemini format
    const conversationHistory = [
      {
        role: "user",
        parts: [{ text: systemPrompt }],
      },
      {
        role: "model",
        parts: [
          {
            text: '{"title":"Ready to Help","response":"I understand. I will always respond with only a valid JSON object containing both a title and detailed career counseling response with proper markdown formatting."}',
          },
        ],
      },
    ];

    // Add previous conversation history
    sessionHistory.forEach((msg) => {
      if (msg.role === "assistant") {
        // For assistant messages, we need to store the full response, not just the response field
        conversationHistory.push({
          role: "model",
          parts: [{ text: msg.content }],
        });
      } else {
        conversationHistory.push({
          role: "user",
          parts: [{ text: msg.content }],
        });
      }
    });

    // Add current user message
    conversationHistory.push({
      role: "user",
      parts: [{ text: message }],
    });

    const requestBody = {
      contents: conversationHistory,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048, // Increased for JSON + detailed response
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE",
        },
      ],
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let details: unknown;
      try {
        details = await response.json();
      } catch {
        details = await response.text();
      }
      console.error("Gemini API Error:", response.status, details);
      throw new Error(
        `Gemini API request failed: ${response.status} ${response.statusText}`
      );
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response generated from Gemini API");
    }

    const aiResponseText = data.candidates[0]?.content?.parts?.[0]?.text;

    if (!aiResponseText) {
      throw new Error("Invalid response format from Gemini API");
    }

    // Parse the JSON response with fallback handling
    return parseAIResponse(aiResponseText);
  } catch (error) {
    console.error("Error calling Gemini API:", error);

    if (error instanceof Error) {
      throw error;
    }

    throw new Error("Failed to get response from AI service");
  }
}

/**
 * Enhanced function that automatically fetches session history from database
 * This is what the tRPC router will call
 */
export async function getAIResponse(
  message: string,
  sessionId: string,
  db: NodePgDatabase<typeof schema>
): Promise<AIResponse> {
  try {
    // Fetch recent conversation history from database
    const recentMessages = await db
      .select({
        sender: messages.sender,
        content: messages.content,
      })
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt)
      .limit(10); // Limit to last 10 messages for context

    // Convert database messages to ChatMessage format
    const sessionHistory: ChatMessage[] = recentMessages.map((msg) => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.content,
    }));

    return await getCareerCounselingAnswer(message, sessionHistory);
  } catch (error) {
    console.error("Error in getAIResponse:", error);

    // Fallback response if AI service fails
    return {
      title: "Service Unavailable",
      response: "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment or feel free to rephrase your question."
    };
  }
}

// Export types for use in other files
export type { AIResponse, ChatMessage };