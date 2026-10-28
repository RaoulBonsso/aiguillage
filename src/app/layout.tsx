import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { NavPrincipale } from "@/components/NavPrincipale";
import "./globals.css";

// Geist pour l'interface et les titres, Geist Mono pour le code et les chiffres
// (voir docs/DESIGN.md).
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="fr" className={`${geist.variable} ${geistMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-signal-500 focus:px-3 focus:py-2 focus:text-rail-950"
        >
          Aller au contenu
        </a>

        <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-rail-950/75 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-[77.5rem] items-stretch gap-6 px-5">
            <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Aiguillage, accueil">
              <Logo />
              <span className="titre-voie text-[17px] leading-none">Aiguillage</span>
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
              <span className="rounded-full bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] text-rail-300 ring-1 ring-inset ring-white/10">v1</span>
            </div>
          </div>
        </header>

        <main id="contenu" className="flex-1">
          {children}
        </main>

        <footer className="border-t border-white/[0.06]">
          <div className="mx-auto grid max-w-[77.5rem] gap-8 px-5 py-12 text-[13px] text-rail-400 md:grid-cols-[1fr_auto_auto]">
            <div className="max-w-md space-y-2">
              <p className="titre-voie text-[16px] text-rail-100">Aiguillage</p>
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
    <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-signal-500 shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_6px_16px_-6px_rgb(255_197_61/0.7)]" aria-hidden>
      <svg viewBox="0 0 24 24" className="h-5 w-5 text-rail-950">
        <path d="M4 21V12c0-3.5 2.5-6 6-6h10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M4 12V3" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}
