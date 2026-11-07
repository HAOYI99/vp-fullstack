import type { UserClaims } from "@supabase/server";
import { withSupabase } from "@supabase/server/adapters/hono";
import type { Context, MiddlewareHandler } from "hono";
import { createMiddleware } from "hono/factory";

export type UserContext = {
  Variables: {
    requestId?: string;
    dbUser: {
      id: string;
      email: string;
      name: string;
    };
  };
};

type SupabaseContextVariables = {
  Variables: {
    supabaseContext: {
      userClaims: UserClaims | null;
    };
  };
};

// Keep the package context internal so it does not leak into the public AppType.
const supabaseAuth = withSupabase({
  auth: "user",
}) as unknown as MiddlewareHandler<SupabaseContextVariables>;

export const DEV_USER = {
  id: "11111111-1111-1111-1111-111111111111",
  email: "dev@template.local",
  name: "Dev User",
};

export const DEV_TOKEN_SECRET = "DEV_TOKEN_SECRET_123";

const isDevToken = (token: string) =>
  (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") &&
  (token === DEV_TOKEN_SECRET || token.startsWith("DEV_TOKEN_"));

const getUserName = (metadata: Record<string, unknown> | undefined) => {
  const fullName = metadata?.full_name;
  if (typeof fullName === "string") {
    return fullName;
  }

  const name = metadata?.name;
  return typeof name === "string" ? name : "";
};

export const requireAuth = createMiddleware<UserContext>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized: Missing or invalid Authorization header" }, 401);
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return c.json({ error: "Unauthorized: Missing token" }, 401);
  }

  if (isDevToken(token)) {
    c.set("dbUser", DEV_USER);
    return next();
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) {
    return c.json({ error: "Unauthorized: Supabase is not configured on this server" }, 401);
  }

  let response: Response | undefined;
  await supabaseAuth(c as unknown as Context<SupabaseContextVariables>, async () => {
    const userClaims = (c as unknown as Context<SupabaseContextVariables>).var.supabaseContext
      ?.userClaims;
    if (!userClaims) {
      response = c.json({ error: "Unauthorized: User claims missing" }, 401);
      return;
    }

    const dbUser = {
      id: userClaims.id,
      email: userClaims.email ?? "",
      name: getUserName(userClaims.userMetadata),
    };

    c.set("dbUser", dbUser);
    await next();
  });

  return response;
});
