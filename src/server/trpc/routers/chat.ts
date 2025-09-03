import { chatSessions, messages } from "@/db/schema";
import { and, eq, asc } from "drizzle-orm";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "..";
import { getAIResponse } from "@/lib/gemini";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.uuid("Invalid session ID format"),
        message: z
          .string()
          .min(1, "Message cannot be empty")
          .max(2000, "Message too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { sessionId, message } = input;
      const userId = ctx.session.user?.id;
      if (!userId) throw new Error("User not authenticated");

      try {
        // 1️⃣ Save user message
        const [userMessage] = await ctx.db
          .insert(messages)
          .values({ sessionId, sender: "user", content: message })
          .returning();

        // 2️⃣ Check if session still has default title
        const [session] = await ctx.db
          .select()
          .from(chatSessions)
          .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)));

        if (session && session.title === "New Chat") {
          try {
            // Ask Gemini for a short, descriptive title
            const generatedTitle = await getAIResponse(
              `Generate a very short title (max 5 words) for this conversation based on the message: "${message}". 
              Just output the title, no extra text.`,
              sessionId,
              ctx.db
            );

            // Update session with Gemini-generated title
            await ctx.db
              .update(chatSessions)
              .set({ title: generatedTitle })
              .where(eq(chatSessions.id, sessionId));
          } catch (err) {
            console.error("Failed to generate title:", err);
            // fallback: truncate message
            const fallbackTitle =
              message.length > 40 ? message.slice(0, 40) + "..." : message;
            await ctx.db
              .update(chatSessions)
              .set({ title: fallbackTitle })
              .where(eq(chatSessions.id, sessionId));
          }
        }

        // 3️⃣ Get AI response for conversation
        const aiResponseContent = await getAIResponse(message, sessionId, ctx.db);

        // 4️⃣ Save AI response
        const [aiMessage] = await ctx.db
          .insert(messages)
          .values({ sessionId, sender: "ai", content: aiResponseContent })
          .returning();

        return { userMessage, aiMessage, success: true };
      } catch (error) {
        console.error("Error in sendMessage:", error);
        throw new Error("Failed to send message and get AI response");
      }
    }),


  getMessages: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid("Invalid session ID format"),
      })
    )
    .query(async ({ ctx, input }) => {

      const { sessionId } = input;
      const userId = ctx.session.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        // Get all messages for the session, ordered by creation time
        
        const sessionMessages = await ctx.db
          .select()
          .from(messages)
          .where(eq(messages.sessionId, sessionId))
          .orderBy(asc(messages.createdAt));

        return {
          messages: sessionMessages,
          success: true,
        };
      } catch (error) {
        console.error("Error in getMessages:", error);
        throw new Error("Failed to retrieve messages");
      }
    }),

  // Additional query to get recent messages with pagination
  getRecentMessages: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid("Invalid session ID format"),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      
      const { sessionId, limit, offset } = input;
      const userId = ctx.session.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {
        
        const sessionMessages = await ctx.db
          .select()
          .from(messages)
          .where(eq(messages.sessionId, sessionId))
          .orderBy(asc(messages.createdAt))
          .limit(limit)
          .offset(offset);

        return {
          messages: sessionMessages,
          hasMore: sessionMessages.length === limit,
          success: true,
        };
      } catch (error) {
        console.error("Error in getRecentMessages:", error);
        throw new Error("Failed to retrieve recent messages");
      }
    }),
});
