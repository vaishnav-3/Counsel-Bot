import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure } from '..';
import { chatSessions } from '@/db/schema';

export const sessionRouter = createTRPCRouter({
  getSessions: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.session.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const sessions = await ctx.db
          .select({
            id: chatSessions.id,
            title: chatSessions.title,
            createdAt: chatSessions.createdAt,
          })
          .from(chatSessions)
          .where(eq(chatSessions.userId, userId))
          .orderBy(desc(chatSessions.createdAt));

        return {
          sessions,
          success: true,
        };
      } catch (error) {
        console.error('Error fetching sessions:', error);
        throw new Error('Failed to fetch chat sessions');
      }
    }),

  createSession: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, 'Title cannot be empty').max(255, 'Title too long').default('New Chat'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const [newSession] = await ctx.db
          .insert(chatSessions)
          .values({
            userId,
            title: input.title,
          })
          .returning();

        return {
          session: newSession,
          success: true,
        };
      } catch (error) {
        console.error('Error creating session:', error);
        throw new Error('Failed to create chat session');
      }
    }),

  getSession: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid('Invalid session ID format'),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const [session] = await ctx.db
          .select()
          .from(chatSessions)
          .where(eq(chatSessions.id, input.sessionId));

        if (!session || session.userId !== userId) {
          throw new Error('Session not found or access denied');
        }

        return {
          session,
          success: true,
        };
      } catch (error) {
        console.error('Error fetching session:', error);
        throw new Error('Failed to fetch chat session');
      }
    }),

  updateSessionTitle: protectedProcedure
    .input(
      z.object({
        sessionId: z.string().uuid('Invalid session ID format'),
        title: z.string().min(1, 'Title cannot be empty').max(255, 'Title too long'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      try {
        const [updatedSession] = await ctx.db
          .update(chatSessions)
          .set({ title: input.title })
          .where(eq(chatSessions.id, input.sessionId))
          .returning();

        if (!updatedSession || updatedSession.userId !== userId) {
          throw new Error('Session not found or access denied');
        }

        return {
          session: updatedSession,
          success: true,
        };
      } catch (error) {
        console.error('Error updating session title:', error);
        throw new Error('Failed to update session title');
      }
    }),
});