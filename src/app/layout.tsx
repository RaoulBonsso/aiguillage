import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
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
    "L'offre ferroviaire exposée aux canaux de vente : une API REST spécifiée en OpenAPI, son portail de documentation et sa console d'administration.",
};

const liens = [
  { href: "/", libelle: "Accueil" },
  { href: "/docs", libelle: "Documentation" },
  { href: "/guide", libelle: "Guide" },
  { href: "/presentation", libelle: "Présentation" },
  { href: "/admin", libelle: "Console" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b border-rail-800/80 bg-rail-950/80 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
            <Link href="/" className="group flex items-center gap-2.5">
              <Aiguille />
              <span className="font-semibold tracking-tight">Aiguillage</span>
            </Link>
            {/* Défilement horizontal plutôt qu'un menu burger : cinq liens
                courts se parcourent au pouce sans ouvrir quoi que ce soit. */}
            <nav className="-mx-1 flex flex-1 items-center gap-1 overflow-x-auto px-1 text-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {liens.map((lien) => (
                <Link
                  key={lien.href}
                  href={lien.href}
                  className="shrink-0 rounded-md px-3 py-1.5 text-rail-300 transition-colors hover:bg-rail-850 hover:text-rail-100"
                >
                  {lien.libelle}
                </Link>
              ))}
            </nav>
            <span className="hidden shrink-0 rounded-full border border-rail-800 px-2.5 py-1 font-mono text-[11px] text-rail-400 sm:block">
              v1
            </span>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-rail-800/80">
          <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-rail-400">
            <p>
              Aiguillage est une démonstration technique. Les transporteurs, lignes et tarifs
              présentés sont fictifs.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

/** Le pictogramme : deux voies qui divergent depuis un même point. */
function Aiguille() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-5 w-5 text-signal-500">
      <path
        d="M3 20V9a3 3 0 0 1 3-3h1M3 20h4M3 14h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 6h4l4-3M7 14h6l5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.7"
      />
    </svg>
  );
}
