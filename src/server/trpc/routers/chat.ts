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
        //Save user message
        const [userMessage] = await ctx.db
          .insert(messages)
          .values({ sessionId, sender: "user", content: message })
          .returning();

        //Get AI response (returns { title, response })
        const aiResponse = await getAIResponse(message, sessionId, ctx.db);
        
        //Save AI response content only (not the JSON)
        const [aiMessage] = await ctx.db
          .insert(messages)
          .values({ 
            sessionId, 
            sender: "assistant", 
            content: aiResponse.response // Only save the markdown response
          })
          .returning();

        // Update session title if it's still the default
        const [session] = await ctx.db
          .select()
          .from(chatSessions)
          .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.userId, userId)));

        if (session && session.title === "New Chat") {
          try {
            // Use the AI-generated title
            await ctx.db
              .update(chatSessions)
              .set({ 
                title: aiResponse.title,
              })
              .where(eq(chatSessions.id, sessionId));
          } catch (err) {
            console.error("Failed to update session title:", err);
            // Fallback: use truncated message
            const fallbackTitle = message.length > 40 ? message.slice(0, 40) + "..." : message;
            await ctx.db
              .update(chatSessions)
              .set({ 
                title: fallbackTitle,
              })
              .where(eq(chatSessions.id, sessionId));
          }
        }

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
        // Verify user owns this session
        const session = await ctx.db
          .select()
          .from(chatSessions)
          .where(and(
            eq(chatSessions.id, sessionId),
            eq(chatSessions.userId, userId)
          ))
          .limit(1);

        if (!session.length) {
          throw new Error("Session not found or access denied");
        }

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

});