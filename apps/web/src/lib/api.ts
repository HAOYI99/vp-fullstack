import { hc } from "hono/client";
import type { AppType } from "@template/api";
import type { CreateTodoInput, Todo, UpdateTodoInput } from "@template/shared";
import { supabase } from "./auth";

const apiBaseUrl = import.meta.env.VITE_API_URL ?? "/";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

export const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const headers = new Headers(init?.headers);

  let token: string | undefined;
  if (typeof window !== "undefined" && localStorage.getItem("template_dev_user") === "true") {
    token = "DEV_TOKEN_SECRET_123";
  } else if (supabase) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    token = session?.access_token;
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let res = await fetch(input, { ...init, headers });

  if (res.status === 401 && supabase) {
    const {
      data: { session: refreshedSession },
      error,
    } = await supabase.auth.refreshSession();

    if (refreshedSession && !error) {
      const retryHeaders = new Headers(init?.headers);
      retryHeaders.set("Authorization", `Bearer ${refreshedSession.access_token}`);
      res = await fetch(input, { ...init, headers: retryHeaders });
    }
  }

  return res;
};

export async function handleRpcResponse<T>(responsePromise: Promise<Response>): Promise<T> {
  const res = await responsePromise;
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
    throw new ApiError(res.status, body.error || body.message || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

/**
 * Type-safe Hono RPC client inferred directly from @template/api AppType
 */
export const apiClient = hc<AppType>(apiBaseUrl, {
  fetch: customFetch,
});

export async function listTodos(): Promise<Todo[]> {
  return handleRpcResponse<Todo[]>(apiClient.api.todos.$get());
}

export async function createTodo(input: CreateTodoInput): Promise<Todo> {
  return handleRpcResponse<Todo>(
    apiClient.api.todos.$post({
      json: input,
    }),
  );
}

export async function updateTodo(id: string, input: UpdateTodoInput): Promise<Todo> {
  return handleRpcResponse<Todo>(
    apiClient.api.todos[":id"].$patch({
      param: { id },
      json: input,
    }),
  );
}

export async function getCurrentUser() {
  return handleRpcResponse<{ user: { id: string; email: string; name: string } }>(
    apiClient.api.auth.me.$get(),
  );
}
