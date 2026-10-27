"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * La navigation, numérotée comme des voies : on sait où l'on est, et dans
 * quel ordre lire le projet (le produit, puis la doc, puis le pourquoi).
 */
const voies = [
  { href: "/", numero: "01", libelle: "Le produit" },
  { href: "/docs", numero: "02", libelle: "Documentation" },
  { href: "/guide", numero: "03", libelle: "Guide technique" },
  { href: "/admin", numero: "04", libelle: "Console" },
  { href: "/presentation", numero: "05", libelle: "Présentation" },
];

export function NavPrincipale() {
  const chemin = usePathname();

  return (
    // Défilement horizontal plutôt qu'un menu burger : cinq voies se parcourent
    // au pouce sans rien ouvrir.
    <nav
      aria-label="Navigation principale"
      className="-mx-1 flex flex-1 items-stretch overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {voies.map((voie) => {
        const actif = voie.href === "/" ? chemin === "/" : chemin.startsWith(voie.href);
        return (
          <Link
            key={voie.href}
            href={voie.href}
            aria-current={actif ? "page" : undefined}
            className={`group relative flex shrink-0 items-center gap-2 px-3 text-[13px] transition-colors ${
              actif ? "text-rail-100" : "text-rail-400 hover:text-rail-100"
            }`}
          >
            <span
              className={`font-mono text-[11px] transition-colors ${
                actif ? "text-signal-500" : "text-rail-600 group-hover:text-rail-400"
              }`}
            >
              {voie.numero}
            </span>
            {voie.libelle}
            <span
              aria-hidden
              className={`absolute inset-x-3 bottom-0 h-[2px] bg-signal-500 transition-opacity ${
                actif ? "opacity-100" : "opacity-0"
              }`}
            />
          </Link>
        );
      })}
    </nav>
  );
}
