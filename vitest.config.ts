import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Minimal Vitest setup. jsdom gives DOMPurify a DOM to sanitize against.
// The "@/" alias mirrors tsconfig so tests import app modules the same way.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts"],
  },
});
