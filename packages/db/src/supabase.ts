import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import {
  createSupabaseContext,
  withSupabase,
  type SupabaseContext,
  type WithSupabaseConfig,
} from "@supabase/server";

export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

/**
 * Browser-safe Supabase client (@supabase/supabase-js)
 */
export function createSupabaseBrowserClient(config?: Partial<SupabaseConfig>) {
  const url =
    config?.url ?? (typeof process !== "undefined" ? process.env.SUPABASE_URL : undefined);
  const publishableKey =
    config?.publishableKey ??
    (typeof process !== "undefined"
      ? (process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY)
      : undefined);

  if (!url || !publishableKey) {
    return null;
  }

  return createSupabaseClient(url, publishableKey);
}

/**
 * Server-side Supabase helpers (@supabase/server) for Hono / Web Fetch handlers
 */
export { createSupabaseContext, withSupabase, type SupabaseContext, type WithSupabaseConfig };
