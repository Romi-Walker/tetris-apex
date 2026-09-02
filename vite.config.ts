import { defineConfig } from "vitest/config";

export default defineConfig({
  base: "/tetris-apex/",
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
