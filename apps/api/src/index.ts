import { createDatabase } from "@template/db";
import { createApp, type AppType } from "./app";
import { env } from "./env";

const dbInstance = env.DATABASE_URL ? createDatabase({ url: env.DATABASE_URL }) : null;
const db = dbInstance?.db ?? null;

export const app = createApp({
  db,
  corsOrigin: env.CORS_ORIGIN,
});

export type { AppType };
export default app;
