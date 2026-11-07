import { serve } from "@hono/node-server";
import { createDatabase } from "@template/db";
import { createApp } from "./app";
import { env } from "./env";

const dbInstance = env.DATABASE_URL ? createDatabase({ url: env.DATABASE_URL }) : null;
const db = dbInstance?.db ?? null;

const app = createApp({
  db,
  corsOrigin: env.CORS_ORIGIN,
});

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`API listening on http://localhost:${info.port}`);
  },
);
