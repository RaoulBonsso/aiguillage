import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
    // Les composants React sont testés en jsdom, le reste (domaine, API) en node :
    // un domaine qui n'a pas besoin d'un DOM ne doit pas en payer le prix.
    environmentMatchGlobs: [["src/**/*.tsx", "jsdom"]],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
