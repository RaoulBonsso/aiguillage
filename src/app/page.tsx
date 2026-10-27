import Link from "next/link";
import { demoSecret } from "@/lib/api-context";
import { offers, stations } from "@/data/catalog";
import { operationsParTheme } from "@/lib/spec-view";
import { TableauDesDeparts } from "@/components/home/TableauDesDeparts";
import { PlanDeVoies } from "@/components/home/PlanDeVoies";

// Le catalogue est un horaire glissant : on régénère la page chaque heure pour
// que le tableau des départs propose des jours qui existent.
export const revalidate = 3600;

const DEPOT = "https://github.com/RaoulBonsso/aiguillage";

/**
 * La page d'accueil. En cinq secondes : ce que c'est (une API qui met des
 * trains en vente), à qui ça sert (les sites, applis et agences qui vendent
 * des billets), et ce que ça prouve techniquement. Puis on l'essaie en vrai.
 */
export default function Accueil() {
  const nombreOperations = operationsParTheme().reduce(
    (total, theme) => total + theme.operations.length,
    0,
  );

  // Les trajets directs proposés dans le tableau, dérivés du catalogue réel.
  const vus = new Set<string>();
  const trajets: { origin: string; destination: string }[] = [];
  for (const offre of offers) {
    const cle = `${offre.origin}-${offre.destination}`;
    if (!vus.has(cle)) {
      vus.add(cle);
      trajets.push({ origin: offre.origin, destination: offre.destination });
    }
  }
  trajets.sort((a, b) => (a.origin === "FRPAR" && a.destination === "FRNTE" ? -1 : b.origin === "FRPAR" && b.destination === "FRNTE" ? 1 : 0));
  const jours = [...new Set(offers.map((offre) => offre.departure.slice(0, 10)))].sort().slice(1, 6);

  return (
    <>
      {/* ── 01 · Le produit ───────────────────────────────────────────── */}
      <section className="border-b border-rail-800">
        <div className="mx-auto grid max-w-[84rem] gap-10 px-5 py-12 lg:grid-cols-[minmax(0,11fr)_minmax(0,13fr)] lg:gap-14 lg:py-16">
          <div className="flex flex-col">
            <p className="etiquette flex items-center gap-3 text-rail-400">
              <span className="pave-voie">01</span>
              API de distribution ferroviaire
            </p>
            <h1 className="titre-voie mt-7 text-[clamp(3rem,6vw,5.6rem)] text-rail-100">
              <span className="block whitespace-nowrap">L&apos;API qui met</span>
              <span className="block">les trains</span>
              <span className="block text-signal-500">en vente.</span>
            </h1>
            <p className="mt-7 max-w-[34rem] text-[17px] leading-relaxed text-rail-300">
              Un site, une appli ou une agence qui vend des billets a besoin de trois choses : les
              horaires, les prix, et les places restantes. <strong className="font-semibold text-rail-100">Aiguillage les sert par une API REST</strong>,
              avec sa documentation et sa console d&apos;accès — construits comme un vrai produit.
            </p>

            <dl className="mt-9 grid grid-cols-3 border-y border-rail-800">
              <Chiffre valeur={String(nombreOperations)} libelle="opérations" />
              <Chiffre valeur="54" libelle="tests, dont 18 de contrat" />
              <Chiffre valeur={offers.length.toLocaleString("fr-FR")} libelle="départs sur 21 jours" />
            </dl>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="group inline-flex items-center gap-3 bg-signal-500 px-5 py-3 text-[14px] font-semibold text-rail-950 transition-[background-color,transform] hover:bg-signal-400 active:scale-[0.98]"
              >
                Lire la documentation
                <Fleche />
              </Link>
              <a
                href={DEPOT}
                className="inline-flex items-center gap-3 border border-rail-700 px-5 py-3 text-[14px] font-medium text-rail-100 transition-colors hover:border-rail-400"
              >
                Voir le code
              </a>
            </div>
          </div>

          <div className="lg:pt-2">
            <TableauDesDeparts stations={stations} trajets={trajets} jours={jours} cleDemo={demoSecret()} />
          </div>
        </div>
      </section>

      {/* ── 02 · Ce que ça prouve ─────────────────────────────────────── */}
      <section className="border-b border-rail-800">
        <div className="mx-auto max-w-[84rem] px-5 py-16">
          <EnTete numero="02" surtitre="Fiche technique" titre="Ce que le projet prouve" />
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-rail-400">
            Chaque affirmation renvoie à l&apos;endroit du code où on peut la vérifier. Rien n&apos;est
            décoratif.
          </p>

          <ol className="mt-10 border-t border-rail-100">
            {preuves.map((preuve, index) => (
              <li
                key={preuve.titre}
                className="group grid gap-x-8 gap-y-2 border-b border-rail-800 py-6 md:grid-cols-[4rem_minmax(0,18rem)_minmax(0,1fr)_minmax(0,14rem)]"
              >
                <span className="chiffres font-mono text-[13px] text-rail-600">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="titre-voie text-[26px] text-rail-100">{preuve.titre}</h3>
                <p className="max-w-xl text-[15px] leading-relaxed text-rail-300">{preuve.detail}</p>
                <a
                  href={`${DEPOT}/blob/main/${preuve.fichier}`}
                  className="self-start font-mono text-[12px] text-rail-400 underline decoration-rail-700 underline-offset-4 transition-colors hover:text-signal-400 hover:decoration-signal-500 md:justify-self-end md:text-right"
                >
                  {preuve.fichier}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 03 · Le trajet d'une requête (planche claire) ─────────────── */}
      <section className="bg-plan-50 text-plan-900">
        <div className="mx-auto max-w-[84rem] px-5 py-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="etiquette flex items-center gap-3 text-plan-600">
                <span className="pave-voie">03</span>
                Architecture
              </p>
              <h2 className="titre-voie mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)]">
                Le trajet d&apos;une requête
              </h2>
            </div>
            <p className="max-w-md text-[15px] leading-relaxed text-plan-600">
              Toutes les garanties vivent dans une seule enveloppe. Aucune route ne les réimplémente,
              donc aucune ne peut les oublier.
            </p>
          </div>
          <PlanDeVoies />
        </div>
      </section>

      {/* ── 04 · Les livrables ────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[84rem] px-5 py-16">
          <EnTete numero="04" surtitre="Les livrables" titre="Trois livrables, un seul contrat" />
          <ul className="mt-10 grid border-l border-t border-rail-800 md:grid-cols-3">
            {livrables.map((livrable) => (
              <li key={livrable.titre} className="border-b border-r border-rail-800">
                <Link
                  href={livrable.href}
                  className="group flex h-full flex-col p-6 transition-colors hover:bg-rail-900"
                >
                  <span className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-rail-500">{livrable.chemin}</span>
                    <span className="text-rail-600 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-signal-500">
                      <Fleche />
                    </span>
                  </span>
                  <span className="titre-voie mt-8 text-[34px] text-rail-100">{livrable.titre}</span>
                  <span className="mt-3 text-[14px] leading-relaxed text-rail-400">{livrable.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

const preuves = [
  {
    titre: "Le contrat d'abord",
    detail:
      "La spec OpenAPI est commitée avant le premier handler (commit ff123b0). C'est elle qui a guidé le code, et l'historique git le montre.",
    fichier: "spec/openapi.yaml",
  },
  {
    titre: "Une doc qui ne ment pas",
    detail:
      "Chaque réponse de l'API est validée par Ajv contre le schéma publié. Servir un champ non documenté fait échouer la suite de tests.",
    fichier: "src/app/api/v1/routes.test.ts",
  },
  {
    titre: "Des clés bien gardées",
    detail:
      "Les clés sont stockées hachées, comparées en temps constant, révocables à chaud. Quota mensuel par clé, en-têtes RateLimit-* standard.",
    fichier: "src/domain/apikeys.ts",
  },
  {
    titre: "Des erreurs utiles",
    detail:
      "Les erreurs suivent la RFC 9457 (problem+json) et nomment le champ fautif. L'intégrateur corrige en dix secondes, sans ouvrir de ticket.",
    fichier: "src/lib/problem.ts",
  },
  {
    titre: "Un domaine isolé",
    detail:
      "Les règles métier ne connaissent ni HTTP ni stockage (ports et adaptateurs). Les 54 tests tournent en moins d'une seconde.",
    fichier: "src/domain/ports.ts",
  },
];

const livrables = [
  {
    href: "/docs",
    chemin: "/docs",
    titre: "Le portail",
    detail: "Généré depuis la spec, sans une ligne écrite à la main. Chaque opération s'essaie en direct.",
  },
  {
    href: "/admin",
    chemin: "/admin",
    titre: "La console",
    detail: "Émettre et révoquer des clés, suivre les quotas, lire le journal des appels.",
  },
  {
    href: "/guide",
    chemin: "/guide",
    titre: "Le guide",
    detail: "Les choix d'architecture expliqués, avec leur coût et ce qu'ils interdisent.",
  },
];

function EnTete({ numero, surtitre, titre }: { numero: string; surtitre: string; titre: string }) {
  return (
    <div>
      <p className="etiquette flex items-center gap-3 text-rail-400">
        <span className="pave-voie">{numero}</span>
        {surtitre}
      </p>
      <h2 className="titre-voie mt-5 text-[clamp(2.2rem,4.6vw,3.8rem)] text-rail-100">{titre}</h2>
    </div>
  );
}

function Chiffre({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <div className="border-r border-rail-800 py-4 pr-3 last:border-r-0 [&:not(:first-child)]:pl-4">
      <dt className="sr-only">{libelle}</dt>
      <dd className="chiffres titre-voie text-[40px] text-rail-100">{valeur}</dd>
      <dd className="mt-1 text-[12px] leading-snug text-rail-500">{libelle}</dd>
    </div>
  );
}

function Fleche() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
