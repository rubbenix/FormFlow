import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        "examples/",
        "tests/setup.ts",
        "*.config.ts",
        "*.config.js",
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@formflow/core": new URL("./src/core/index.ts", import.meta.url)
        .pathname,
      "@formflow/types": new URL("./src/types/index.ts", import.meta.url)
        .pathname,
      "@formflow/validators": new URL(
        "./src/validators/index.ts",
        import.meta.url,
      ).pathname,
    },
  },
});
