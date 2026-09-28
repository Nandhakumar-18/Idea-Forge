import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { ideaForgeRouter } from "./ideaForge";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  ideaForge: ideaForgeRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    demoLogin: publicProcedure.input(z.object({ username: z.string() })).mutation(async ({ input, ctx }) => {
      const { sdk } = await import("./_core/sdk");
      const { User } = await import("./models");
      const { ONE_YEAR_MS } = await import("@shared/const");

      let user = await User.findOne({ name: input.username });
      if (!user) {
         const role = input.username === "organizer" ? "organizer" : input.username.startsWith("judge") ? "judge" : "user";
         user = await User.create({ openId: `dogfood_${input.username}_${Date.now()}`, name: input.username, role });
      }

      const token = await sdk.createSessionToken(user.openId, { name: user.name, expiresInMs: ONE_YEAR_MS });
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      
      return { success: true, user };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
