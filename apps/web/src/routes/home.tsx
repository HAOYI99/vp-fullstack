import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@template/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@template/ui/components/card";
import { Input } from "@template/ui/components/input";
import { Badge } from "@template/ui/components/badge";
import { Checkbox } from "@template/ui/components/checkbox";
import { signInWithGoogle, signOut, supabase } from "../lib/auth";
import { todosQueryOptions, useCreateTodoMutation, useUpdateTodoMutation } from "../lib/todos";
import { usePreferencesStore } from "../stores/preferences";

export function HomePage() {
  const [title, setTitle] = React.useState("");
  const [user, setUser] = React.useState<{ email?: string | null } | null>(() => {
    if (typeof window !== "undefined" && localStorage.getItem("template_dev_user") === "true") {
      return { email: "dev@template.local" };
    }
    return null;
  });
  const { data: todos, isLoading, isError } = useQuery(todosQueryOptions);
  const createTodoMutation = useCreateTodoMutation();
  const updateTodoMutation = useUpdateTodoMutation();
  const density = usePreferencesStore((state) => state.density);

  React.useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignIn = async () => {
    if (!supabase) {
      localStorage.setItem("template_dev_user", "true");
      setUser({ email: "dev@template.local" });
      return;
    }
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    localStorage.removeItem("template_dev_user");
    setUser(null);
    if (supabase) {
      await signOut();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || createTodoMutation.isPending) return;
    createTodoMutation.mutate(
      { title: title.trim() },
      {
        onSuccess: () => setTitle(""),
      },
    );
  };

  const completedCount = todos?.filter((t) => t.completed).length ?? 0;
  const totalCount = todos?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todos</h1>
          <p className="text-muted-foreground mt-1">
            Full-stack React + Hono + Drizzle demo powered by TanStack Query & VitePlus.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{user.email}</span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={handleSignIn}>
              {supabase ? "Sign in with Google" : "Dev Sign In"}
            </Button>
          )}
          <Badge
            variant={completedCount === totalCount && totalCount > 0 ? "default" : "secondary"}
          >
            {completedCount} of {totalCount} completed
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a new task</CardTitle>
          <CardDescription>Creates a record validated with shared Zod contracts.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createTodoMutation.isPending}
            />
            <Button type="submit" disabled={!title.trim() || createTodoMutation.isPending}>
              {createTodoMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks List</CardTitle>
          <CardDescription>Live state synchronized via TanStack Query.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading tasks...
            </div>
          )}

          {isError && (
            <div className="py-8 text-center text-destructive">
              Failed to load tasks. Make sure the API server is running on port 3000.
            </div>
          )}

          {!isLoading && !isError && todos && todos.length === 0 && (
            <div className="py-8 text-center text-muted-foreground">
              No tasks yet. Create one above!
            </div>
          )}

          {!isLoading && !isError && todos && todos.length > 0 && (
            <ul className="divide-y divide-border">
              {todos.map((todo) => (
                <li
                  key={todo.id}
                  className={`flex items-center justify-between transition-colors hover:bg-muted/50 rounded-lg px-3 ${
                    density === "compact" ? "py-2" : "py-3"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={(checked) =>
                        updateTodoMutation.mutate({
                          id: todo.id,
                          completed: Boolean(checked),
                        })
                      }
                      id={`todo-${todo.id}`}
                    />
                    <label
                      htmlFor={`todo-${todo.id}`}
                      className={`text-sm font-medium cursor-pointer ${
                        todo.completed ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {todo.title}
                    </label>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(todo.createdAt).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
