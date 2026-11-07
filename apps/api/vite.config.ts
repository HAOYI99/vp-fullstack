import devServer from "@hono/vite-dev-server";
import nodeAdapter from "@hono/vite-dev-server/node";
import { defineConfig } from "vite-plus";

export default defineConfig({
  plugins: [
    devServer({
      adapter: nodeAdapter,
      entry: "src/index.ts",
    }),
  ],
  server: {
    port: 3000,
  },
  resolve: {
    tsconfigPaths: true,
  },
});
