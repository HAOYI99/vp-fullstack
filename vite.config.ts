import { defineConfig } from "vite-plus";

export default defineConfig({
  defaultPackage: {
    dev: "./apps/web",
    build: "./apps/web",
    preview: "./apps/web",
  },
  fmt: {
    singleQuote: false,
    semi: true,
  },
  lint: {
    plugins: ["typescript"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
    overrides: [
      {
        files: ["apps/web/**", "packages/ui/**"],
        plugins: ["react"],
      },
      {
        files: ["apps/api/**", "packages/db/**", "scripts/**"],
        env: {
          node: true,
        },
      },
      {
        files: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"],
        plugins: ["vitest"],
      },
    ],
  },
  run: {
    cache: true,
  },
});
