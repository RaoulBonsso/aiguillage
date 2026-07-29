"use client";

import { useEffect, useState } from "react";

/**
 * Navigation latérale qui suit la lecture.
 *
 * L'observateur d'intersection marque la section réellement à l'écran plutôt
 * que de se fier au dernier clic : un lecteur qui fait défiler à la molette
 * doit savoir où il en est, lui aussi.
 */
export function NavGuide({ sections }: { sections: Array<{ id: string; titre: string }> }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observateur = new IntersectionObserver(
      (entrees) => {
        const visibles = entrees
          .filter((entree) => entree.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visibles[0]) setActive(visibles[0].target.id);
      },
      // La bande de détection est calée sous l'en-tête collant et couvre le
      // tiers haut de l'écran : c'est là que se trouve ce qu'on est en train de lire.
      { rootMargin: "-72px 0px -66% 0px", threshold: 0 },
    );

    for (const section of sections) {
      const element = document.getElementById(section.id);
      if (element) observateur.observe(element);
    }

    return () => observateur.disconnect();
  }, [sections]);

  return (
    <nav aria-label="Sommaire du guide" className="space-y-0.5">
      {sections.map((section, rang) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={active === section.id ? "true" : undefined}
          className={`flex items-baseline gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
            active === section.id
              ? "bg-rail-850 text-rail-100"
              : "text-rail-400 hover:bg-rail-900 hover:text-rail-200"
          }`}
        >
          <span
            className={`font-mono text-[11px] ${
              active === section.id ? "text-signal-500" : "text-rail-600"
            }`}
          >
            {String(rang + 1).padStart(2, "0")}
          </span>
          {section.titre}
        </a>
      ))}
    </nav>
  );
}
