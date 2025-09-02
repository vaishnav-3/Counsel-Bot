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
    const systemPrompt = `You are a professional career counselor with extensive experience in helping people with their career development. Your role is to:

1. Provide thoughtful, personalized career advice
2. Ask clarifying questions to better understand the user's situation
3. Offer practical steps and actionable guidance
4. Be supportive and encouraging while being realistic
5. Help with career transitions, skill development, job search strategies, and professional growth
6. Consider the user's background, interests, and goals in your responses

Please provide helpful, professional, and empathetic career counseling advice. Keep responses conversational but informative.`;

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
