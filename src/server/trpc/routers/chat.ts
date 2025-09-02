import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "..";
import { messages } from "@/db/schema";
import { getAIResponse } from "@/lib/gemini";

export const chatRouter = createTRPCRouter({
  sendMessage: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid("Invalid session ID format"),
        message: z
          .string()
          .min(1, "Message cannot be empty")
          .max(2000, "Message too long"),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const { sessionId, message } = input;
      const userId = ctx.session.user?.id;

      if (!userId) {
        throw new Error("User not authenticated");
      }

      try {

        // Step 1: Save user message to database with role "user"
        const userMessageData = {
          sessionId,
          sender: "user" as const,
          content: message,
        };

        const [userMessage] = await ctx.db
          .insert(messages)
          .values(userMessageData)
          .returning();

        // Step 2: Get session history and call AI

        const aiResponseContent = await getAIResponse(
          message,
          sessionId,
          ctx.db
        );

        // Step 3: Save AI response to database with role "assistant"

        const aiMessageData = {
          sessionId,
          sender: "ai" as const,
          content: aiResponseContent,
        };

        const [aiMessage] = await ctx.db
          .insert(messages)
          .values(aiMessageData)
          .returning();

        // Step 4: Return both messages
        return {
          userMessage,
          aiMessage,
          success: true,
        };
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
