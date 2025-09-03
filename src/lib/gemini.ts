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

/**
 * Get career counseling answer from Gemini AI
 */
export async function getCareerCounselingAnswer(
  message: string,
  sessionHistory: ChatMessage[] = []
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;


  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

  try {
    // Create system prompt for career counseling
    const systemPrompt = `
You are a **professional Career Counselor** with extensive experience in guiding people through their career development journey.  

Your role is to provide **empathetic, structured, and actionable advice**.  
When responding, use **clear Markdown formatting** (headings, bullet points, numbered steps, bold/italic emphasis) to make your guidance easy to follow.  

### Guidelines for Your Responses:
1. **Personalized Advice**  
   Tailor your suggestions to the user's background, interests, and career goals.  

2. **Clarifying Questions**  
   Ask thoughtful questions when more context is needed.  

3. **Actionable Guidance**  
   Offer clear next steps, resources, or strategies (e.g., learning paths, job search tips, networking approaches).  

4. **Supportive & Realistic Tone**  
   Be encouraging and empathetic, but also practical about challenges.  

5. **Areas You Can Help With**  
   - Career transitions  
   - Skill development & upskilling  
   - Job search strategies & resume/LinkedIn guidance  
   - Interview preparation  
   - Professional growth & long-term planning  

---

 **Output Style:**  
- Use short paragraphs for readability.  
- Organize answers with **headings, lists, and examples**.  
- Highlight key takeaways with **bold text**.  
- For multi-step plans, use **numbered lists**.  

Remember: The goal is to sound like a **knowledgeable, supportive mentor** who helps the user take clear steps toward career success.`;


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
            text: "I understand. I'm here to help you with your career development and will provide personalized, professional guidance based on your specific situation and goals.",
          },
        ],
      },
    ];

    // Add previous conversation history
    sessionHistory.forEach((msg) => {
      conversationHistory.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      });
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
        maxOutputTokens: 1024,
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

    const aiResponse = data.candidates[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error("Invalid response format from Gemini API");
    }

    return aiResponse.trim();
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
): Promise<string> {
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
    return "I apologize, but I'm having trouble connecting to my AI service right now. Please try again in a moment or feel free to rephrase your question.";
  }
}
