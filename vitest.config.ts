import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Node par défaut : un domaine qui n'a pas besoin d'un DOM ne doit pas en
    // payer le prix. Les tests de composants demandent jsdom au cas par cas,
    // via un commentaire `@vitest-environment jsdom` en tête de fichier.
    environment: "node",
    setupFiles: ["./vitest.setup.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
