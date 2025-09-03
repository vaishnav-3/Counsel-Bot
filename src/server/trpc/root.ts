import { createTRPCRouter } from "./index";
import { chatRouter } from "./routers/chat";
import { sessionRouter } from "./routers/session";

export const appRouter = createTRPCRouter({
  chat: chatRouter,
  session: sessionRouter,
});

export type AppRouter = typeof appRouter;
