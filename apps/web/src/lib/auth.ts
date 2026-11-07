import { createSupabaseBrowserClient } from "@template/db/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createSupabaseBrowserClient({
  url: supabaseUrl,
  publishableKey: supabasePublishableKey,
});

/**
 * Initiates Google OAuth with Supabase.
 * The redirect URL brings the user back to /auth/callback.
 */
export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error(
      "Supabase client not initialized. Please set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in your apps/web/.env file.",
    );
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}
