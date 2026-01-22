import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    typecheck: { enabled: true },
    setupFiles: ["/src/test-util/setup.ts"],
    deps: {
      // Inline zod-to-ts to handle ESM/CJS interop with typescript package
      inline: ["zod-to-ts"],
    },
  },
});
