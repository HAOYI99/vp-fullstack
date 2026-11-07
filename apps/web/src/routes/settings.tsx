import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@template/ui/components/card";
import { Button } from "@template/ui/components/button";
import { Badge } from "@template/ui/components/badge";
import { usePreferencesStore } from "../stores/preferences";

export function SettingsPage() {
  const { density, setDensity } = usePreferencesStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your client preferences and inspect the full-stack architecture.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Display Density</CardTitle>
          <CardDescription>
            Controlled via client Zustand store with local storage persistence.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Button
            variant={density === "comfortable" ? "default" : "outline"}
            onClick={() => setDensity("comfortable")}
          >
            Comfortable
          </Button>
          <Button
            variant={density === "compact" ? "default" : "outline"}
            onClick={() => setDensity("compact")}
          >
            Compact
          </Button>
          <span className="text-sm text-muted-foreground">
            Current: <Badge variant="secondary">{density}</Badge>
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Architecture Stack</CardTitle>
          <CardDescription>How this monorepo is composed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border p-4 rounded-lg space-y-1">
              <div className="font-semibold text-foreground">Frontend</div>
              <div className="text-muted-foreground">
                React 19, TanStack Router (code-first), TanStack Query, Zustand, Tailwind CSS v4,
                shadcn/ui.
              </div>
            </div>
            <div className="border p-4 rounded-lg space-y-1">
              <div className="font-semibold text-foreground">Backend</div>
              <div className="text-muted-foreground">
                Hono, @hono/node-server, Zod schema validation, feature-based modular routing.
              </div>
            </div>
            <div className="border p-4 rounded-lg space-y-1">
              <div className="font-semibold text-foreground">Database & Auth</div>
              <div className="text-muted-foreground">
                Drizzle ORM, Supabase (@supabase/supabase-js, @supabase/ssr), PostgreSQL.
              </div>
            </div>
            <div className="border p-4 rounded-lg space-y-1">
              <div className="font-semibold text-foreground">Toolchain</div>
              <div className="text-muted-foreground">
                VitePlus (vp check, vpx, vp test, vp run), pnpm catalog.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
