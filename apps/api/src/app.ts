import { cors } from "hono/cors";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { AuthError } from "@supabase/server";
import type { Database } from "@template/db";
import { requireAuth, type UserContext } from "./middleware/auth";
import { createTodoRoutes } from "./modules/todos/todos.routes";

type AppOptions = {
  db: Database | null;
  corsOrigin: string;
};

export function createApp({ db, corsOrigin }: AppOptions) {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof HTTPException && err.cause instanceof AuthError) {
      const authError = err.cause;
      return c.json(
        { error: authError.message, code: authError.code },
        (authError.status ?? 401) as 401 | 500,
      );
    }

    if (err instanceof HTTPException) {
      return err.getResponse();
    }

    return c.json({ error: err.message || "Internal Server Error" }, 500);
  });

  app.use(
    "*",
    cors({
      origin: corsOrigin,
      credentials: true,
    }),
  );

  const authRoutes = new Hono<UserContext>().get("/me", requireAuth, (c) => {
    return c.json({
      user: c.get("dbUser"),
    });
  });

  const api = new Hono().route("/todos", createTodoRoutes({ db })).route("/auth", authRoutes);

  return app
    .get("/healthz", (c) =>
      c.json({
        ok: true,
        service: "api",
      }),
    )
    .route("/api", api);
}

export type AppType = ReturnType<typeof createApp>;
