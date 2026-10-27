import type { Metadata } from "next";
import Link from "next/link";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { NavPrincipale } from "@/components/NavPrincipale";
import "./globals.css";

// Archivo est variable en largeur : la même famille donne les titres condensés
// de la signalétique et le texte courant, sans mélanger deux voix.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Aiguillage — API de distribution ferroviaire",
    template: "%s · Aiguillage",
  },
  description:
    "L'API qui met des trains en vente : horaires, tarifs et places disponibles servis aux sites, applis et agences. Contrat OpenAPI écrit avant le code, documentation générée, console d'accès.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${archivo.variable} ${plexMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:bg-signal-500 focus:px-3 focus:py-2 focus:text-rail-950"
        >
          Aller au contenu
        </a>

        <header className="sticky top-0 z-40 border-b border-rail-800 bg-rail-950">
          <div className="mx-auto flex h-14 max-w-[84rem] items-stretch gap-6 px-5">
            <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Aiguillage, accueil">
              <Logo />
              <span className="titre-voie text-[22px] leading-none tracking-wide">Aiguillage</span>
            </Link>
            <NavPrincipale />
            <div className="hidden shrink-0 items-center gap-3 md:flex">
              <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-rail-400">
                <span className="relative flex h-2 w-2" aria-hidden>
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-vert-500 opacity-50" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-vert-500" />
                </span>
                En service
              </span>
              <span className="border border-rail-700 px-1.5 py-0.5 font-mono text-[11px] text-rail-300">v1</span>
            </div>
          </div>
        </header>

        <main id="contenu" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-rail-800">
          <div className="mx-auto grid max-w-[84rem] gap-8 px-5 py-10 text-[13px] text-rail-400 md:grid-cols-[1fr_auto_auto]">
            <div className="max-w-md space-y-2">
              <p className="titre-voie text-[18px] text-rail-100">Aiguillage</p>
              <p>
                Projet de démonstration conçu et développé par Raoul Bonsso. Transporteurs, lignes et
                tarifs sont fictifs.
              </p>
            </div>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <dt className="etiquette text-rail-600">Pile</dt>
              <dd>Next.js 16 · TypeScript · Zod · Ajv · Vitest</dd>
              <dt className="etiquette text-rail-600">Contrat</dt>
              <dd>OpenAPI 3.1</dd>
              <dt className="etiquette text-rail-600">Licence</dt>
              <dd>MIT</dd>
            </dl>
            <div className="flex flex-col gap-1">
              <a
                href="https://github.com/RaoulBonsso/aiguillage"
                className="text-rail-100 underline decoration-rail-700 underline-offset-4 transition-colors hover:decoration-signal-500"
              >
                Code source sur GitHub
              </a>
              <a
                href="/api/openapi"
                className="text-rail-100 underline decoration-rail-700 underline-offset-4 transition-colors hover:decoration-signal-500"
              >
                Télécharger openapi.yaml
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

/** Le pictogramme : une aiguille, une voie qui se sépare en deux, sur un pavé jaune. */
function Logo() {
  return (
    <span className="flex h-8 w-8 items-center justify-center bg-signal-500" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-rail-950">
        <path d="M4 21V12c0-3.5 2.5-6 6-6h10" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M4 12V3" fill="none" stroke="currentColor" strokeWidth="2.4" />
      </svg>
    </span>
  );
}
