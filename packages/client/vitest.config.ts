import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    typecheck: { enabled: true },
    setupFiles: ["/src/test-util/setup.ts"],
  },
});
