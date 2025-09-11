import { eq } from "drizzle-orm";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "@/db/schema";
import { messages } from "@/db/schema";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// interface GeminiResponse {
//   candidates: Array<{
//     content: { parts: Array<{ text: string }> };
//   }>;
// }

interface AIResponse {
  title: string;
  response: string;
}

/**
 * Safely parse AI response into { title, response }
 */
function parseAIResponse(text: string): AIResponse {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : text);

    if (typeof parsed.title === "string" && typeof parsed.response === "string") {
      return { title: parsed.title.trim(), response: parsed.response.trim() };
    }
    throw new Error("Invalid JSON structure");
  } catch {
    // Fallback title extraction
    const firstLine = text.split("\n")[0] || "";
    const title = firstLine.replace(/^#\s*/, "").slice(0, 60) || "Career Discussion";
    return { title, response: text.trim() };
  }
}

/**
 * Call Gemini API for career counseling using Google GenAI library
 */
export async function getCareerCounselingAnswer(
  message: string,
  sessionHistory: ChatMessage[] = []
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");

  // Initialize the Google Generative AI client
  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Get the model
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  });

  const systemPrompt = `
You are a professional Career Counselor.

Respond ONLY with valid JSON:
{
  "title": "Brief descriptive title (max 60 chars)",
  "response": "Detailed markdown advice"
}`;

  try {
    // Start a chat session with history
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        // Convert session history to Gemini format
        ...sessionHistory.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      ],
    });

    // Send the current message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiText = response.text();

    if (!aiText) {
      throw new Error("Empty response from Gemini API");
    }

    return parseAIResponse(aiText);
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to get response from Gemini: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Fetch conversation history from DB + call Gemini
 */
export async function getAIResponse(
  message: string,
  sessionId: string,
  db: NodePgDatabase<typeof schema>
): Promise<AIResponse> {
  try {
    const recentMessages = await db
      .select({ sender: messages.sender, content: messages.content })
      .from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.createdAt)
      .limit(10);

    const history: ChatMessage[] = recentMessages.map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.content,
    }));

    return await getCareerCounselingAnswer(message, history);
  } catch (error) {
    console.error("Error in getAIResponse:", error);
    return {
      title: "Service Unavailable",
      response:
        "Sorry, I'm having trouble connecting to my AI service right now. Please try again later.",
    };
  }
}

// Export types
export type { AIResponse, ChatMessage };