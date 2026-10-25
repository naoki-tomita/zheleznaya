import { defineConfig } from "vitest/config";

export default defineConfig({
  oxc: {
    jsx: {
      runtime: "classic",
      pragma: "h",
      development: false,
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.spec.{ts,tsx}"],
  },
});
