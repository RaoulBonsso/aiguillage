/**
 * Le trajet d'une requête, dessiné comme un plan de ligne.
 *
 * La voie principale traverse les arrêts dans l'ordre réel de `handler.ts`.
 * À chaque contrôle, une aiguille dévie la requête vers une voie d'erreur
 * (problem+json) : c'est littéralement ce que fait le code.
 */

type Arret = {
  code: string;
  titre: string;
  detail: string;
  deviation?: { statut: string; motif: string };
};

const arrets: Arret[] = [
  {
    code: "A",
    titre: "Canal de vente",
    detail: "Un site ou une appli appelle GET /api/v1/offers avec sa clé dans X-API-Key.",
  },
  {
    code: "B",
    titre: "Clé d'API",
    detail: "Hachée, comparée en temps constant au KeyStore. Révoquée = refusée tout de suite.",
    deviation: { statut: "401", motif: "clé absente ou révoquée" },
  },
  {
    code: "C",
    titre: "Quota",
    detail: "Décompté par clé et par mois. Les en-têtes RateLimit-* annoncent ce qui reste.",
    deviation: { statut: "429", motif: "quota épuisé" },
  },
  {
    code: "D",
    titre: "Validation",
    detail: "Zod vérifie les paramètres. Chaque faute est nommée, champ par champ.",
    deviation: { statut: "400", motif: "paramètre invalide" },
  },
  {
    code: "E",
    titre: "Domaine",
    detail: "La recherche dans le catalogue : règles métier pures, sans HTTP ni stockage.",
  },
  {
    code: "F",
    titre: "Réponse 200",
    detail: "Conforme au schéma publié. Les tests de contrat le vérifient à chaque exécution.",
  },
];

export function PlanDeVoies() {
  return (
    <ol className="relative mt-14 grid gap-0 md:grid-cols-6" aria-label="Étapes d'une requête authentifiée">
      {arrets.map((arret, index) => {
        const dernier = index === arrets.length - 1;
        return (
          <li key={arret.code} className="relative pb-8 pl-10 md:pb-0 md:pl-0 md:pr-5 md:pt-16">
            {/* La voie d'erreur : en bureau, une aiguille qui quitte la voie vers le haut. */}
            {arret.deviation ? (
              <div className="mb-3 flex items-end gap-2 md:absolute md:left-[11px] md:top-0 md:mb-0 md:h-[78px]">
                <svg viewBox="0 0 40 78" className="hidden h-[78px] w-10 shrink-0 md:block" aria-hidden>
                  <path d="M2.5 78V46C2.5 28 14 14 32 14h8" fill="none" stroke="#ff5a45" strokeWidth="5" />
                </svg>
                <p className="flex items-center gap-1.5 text-[13px] leading-none md:-ml-1 md:mb-[54px]">
                  <span className="bg-rouge-500 px-1.5 py-1 font-mono text-[12px] font-semibold text-plan-900">
                    {arret.deviation.statut}
                  </span>
                  <span className="whitespace-nowrap text-plan-600">{arret.deviation.motif}</span>
                </p>
              </div>
            ) : null}

            {/* La voie principale : verticale en mobile, horizontale en bureau. */}
            <span
              aria-hidden
              className={`absolute left-[11px] top-0 w-[5px] bg-plan-900 md:left-0 md:top-[74px] md:h-[5px] ${
                dernier ? "h-3 md:w-6" : "h-full md:w-full"
              }`}
            />
            {/* L'arrêt */}
            <span
              aria-hidden
              className={`absolute left-0 top-0 flex h-[27px] w-[27px] items-center justify-center border-[5px] border-plan-900 font-mono text-[11px] font-semibold md:top-16 ${
                dernier ? "bg-signal-500" : "bg-plan-50"
              }`}
            >
              {arret.code}
            </span>

            <div className="md:pt-11">
              <h3 className="titre-voie text-[24px] leading-none">{arret.titre}</h3>
              <p className="mt-2 max-w-[22rem] text-[14px] leading-relaxed text-plan-600">{arret.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
