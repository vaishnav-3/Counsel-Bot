import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { appRouter } from "@/server/trpc/root";
import { createTRPCContext } from "@/server/trpc/context";

// creates a function that processes incoming HTTP requests and routes them to tRPC procedures.
const handler = (req: NextRequest) =>  
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => {
      const mockRes = {
        getHeader: () => undefined,
        setHeader: () => {},
        removeHeader: () => {},
        status: () => mockRes,
        json: () => {},
        send: () => {},
        end: () => {},
        write: () => {},
        statusCode: 200,
        statusMessage: "OK",
      };

      return createTRPCContext({
        req: req as any,
        res: mockRes as any,
        info: {} as any,
      });
    },
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

export { handler as GET, handler as POST };
