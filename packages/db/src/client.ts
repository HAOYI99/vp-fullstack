import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

export type DatabaseOptions = {
  url?: string;
};

export function createDatabase(options?: DatabaseOptions) {
  const connectionString = options?.url ?? process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  // Disable prefetch as it is not supported for "Transaction" pooler mode in Supabase
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client, { schema });

  return { client, db };
}

export type DatabaseInstance = NonNullable<ReturnType<typeof createDatabase>>;
export type Database = DatabaseInstance["db"];
