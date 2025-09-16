import { eq } from "drizzle-orm";
import { GoogleGenAI, Type } from "@google/genai";
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
// function parseAIResponse(text: string): AIResponse {
//   try {
//     const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
//     const parsed = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : text);

//     if (typeof parsed.title === "string" && typeof parsed.response === "string") {
//       return { title: parsed.title.trim(), response: parsed.response.trim() };
//     }
//     throw new Error("Invalid JSON structure");
//   } catch {
//     // Fallback title extraction
//     const firstLine = text.split("\n")[0] || "";
//     const title = firstLine.replace(/^#\s*/, "").slice(0, 60) || "Career Discussion";
//     return { title, response: text.trim() };
//   }
// }

/**
 * Call Gemini API for career counseling using Google GenAI library
 */
export async function getCareerCounselingAnswer(
  message: string,
  sessionHistory: { role: "user" | "assistant"; content: string }[] = []
): Promise<AIResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

  const ai = new GoogleGenAI({ apiKey });

  const config = {
    thinkingConfig: {
      thinkingBudget: -1, // optional
    },
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      required: ["title", "response"],
      properties: {
        title: { type: Type.STRING },
        response: { type: Type.STRING },
      },
    },
    systemInstruction: [
      {
        text: `
        You are a professional Career Counselor.
    
        Your ONLY allowed output is STRICT JSON.
        Never include explanations, comments, or Markdown fences outside the JSON.
    
        The JSON must have exactly these fields:
        {
          "title": "A concise title (max 60 characters, no line breaks, no quotes inside)",
          "response": "A detailed answer in valid Markdown format."
        }
    
        Formatting rules for "response":
        - Use Markdown headings (##, ###) for structure.
        - Use bullet points (-) and numbered lists (1., 2.) for readability.
        - Use **bold** for important terms.
        - Keep paragraphs short (2–3 sentences).
        - Ensure spacing between sections for clarity.
    
        General rules:
        - Always output valid JSON (no trailing commas, properly escaped quotes).
        - "title" must be short, descriptive, and plain text (no Markdown).
        - "response" should be well-structured Markdown that renders cleanly in a chat UI.
        `,
      },
    ],
    
  };

  const contents = [
    ...sessionHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    {
      role: "user",
      parts: [{ text: message }],
    },
  ];

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config,
    contents,
  });

  // response.outputText() is guaranteed JSON thanks to responseSchema
  if (!response.text) {
    throw new Error("Empty response from Gemini");
  }
  return JSON.parse(response.text) as AIResponse;
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