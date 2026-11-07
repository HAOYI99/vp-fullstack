import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { supabase } from "../lib/auth";

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function handleAuth() {
      if (!supabase) {
        await navigate({ to: "/" });
        return;
      }

      const { error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        setError(sessionError.message);
      } else {
        await navigate({ to: "/" });
      }
    }

    void handleAuth();
  }, [navigate]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <h2 className="text-xl font-semibold text-destructive">Authentication Error</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="text-sm underline hover:text-foreground"
        >
          Return to home
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Completing sign in...</p>
    </div>
  );
}
