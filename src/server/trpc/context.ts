import { type FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";

/**
 * Context for tRPC (App Router + fetch adapter)
 */
export const createTRPCContext = async (opts: FetchCreateContextFnOptions) => {
  // you only get req, resHeaders, info
  const session = await getServerSession(authOptions);

  return {
    db,
    session,
    req: opts.req,
    resHeaders: opts.resHeaders,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
