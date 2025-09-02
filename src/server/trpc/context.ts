import { type CreateNextContextOptions } from '@trpc/server/adapters/next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';

/**
 * Creates context for tRPC
 * This is used to pass common dependencies to all tRPC procedures
 */
export const createTRPCContext = async (opts: CreateNextContextOptions) => {
  const { req, res } = opts;
  
  // Get the session from NextAuth
  const session = await getServerSession(req, res, authOptions);

  return {
    db,
    session,
    req,
    res,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;