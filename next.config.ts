import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Le contrat OpenAPI est lu au moment de l'exécution (portail de doc, tests de
  // contrat). Sans cette inclusion explicite, l'analyse de dépendances ne voit
  // pas un `readFileSync` sur un chemin calculé et le fichier manquerait en
  // production — la panne classique du « ça marche en local ».
  outputFileTracingIncludes: {
    "/**": ["./spec/**"],
  },
};

export default nextConfig;
