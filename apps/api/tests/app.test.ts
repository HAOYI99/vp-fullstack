import { describe, expect, it } from "vite-plus/test";
import { createApp } from "../src/app";
import { DEV_TOKEN_SECRET, DEV_USER } from "../src/middleware/auth";

describe("API App", () => {
  const app = createApp({ db: null, corsOrigin: "*" });

  it("GET /healthz returns ok", async () => {
    const res = await app.request("/healthz");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, service: "api" });
  });

  it("GET /api/todos lists demo items", async () => {
    const res = await app.request("/api/todos");
    expect(res.status).toBe(200);
    const body = (await res.json()) as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
  });

  it("GET /api/auth/me requires authentication", async () => {
    const res = await app.request("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me succeeds with dev bearer token", async () => {
    const res = await app.request("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${DEV_TOKEN_SECRET}`,
      },
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { user: typeof DEV_USER };
    expect(body.user).toEqual(DEV_USER);
  });
});
