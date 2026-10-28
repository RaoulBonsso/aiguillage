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
      <section className="relative overflow-hidden">
        <div aria-hidden className="halo pointer-events-none absolute inset-0" />
        <div aria-hidden className="grille-fond pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-[77.5rem] gap-12 px-5 pb-16 pt-14 lg:grid-cols-[minmax(0,10fr)_minmax(0,13fr)] lg:gap-14 lg:pb-16 lg:pt-20">
          <div className="flex min-w-0 flex-col">
            <p className="flex items-center gap-3 text-[13px] text-rail-400">
              <span className="pave-voie">01</span>
              API de distribution ferroviaire
            </p>
            <h1 className="titre-display mt-7 text-[clamp(2.75rem,5.4vw,4.75rem)] text-rail-100">
              L&apos;API qui met les trains <span className="texte-signal">en vente.</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-[17px] leading-relaxed text-rail-300">
              Un site, une appli ou une agence qui vend des billets a besoin de trois choses : les
              horaires, les prix et les places restantes.{" "}
              <strong className="font-semibold text-rail-100">Aiguillage les sert par une API REST</strong>,
              avec sa documentation et sa console d&apos;accès, construites comme un vrai produit.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/docs" className="bouton-primaire group">
                Lire la documentation
                <span className="transition-transform group-hover:translate-x-0.5">
                  <Fleche />
                </span>
              </Link>
              <a href={DEPOT} className="bouton-secondaire">
                <Github />
                Voir le code
              </a>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-3">
              <Chiffre valeur={String(nombreOperations)} libelle="opérations" />
              <Chiffre valeur="54" libelle="tests, dont 18 de contrat" />
              <Chiffre valeur={offers.length.toLocaleString("fr-FR")} libelle="départs sur 21 jours" />
            </dl>
          </div>

          <div className="min-w-0 lg:pt-1">
            <TableauDesDeparts stations={stations} trajets={trajets} jours={jours} cleDemo={demoSecret()} />
          </div>
        </div>
      </section>

      {/* ── 02 · Ce que ça prouve ─────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[77.5rem] px-5 pb-20 pt-12 lg:pb-24 lg:pt-16">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <EnTete numero="02" surtitre="Fiche technique" titre="Ce que le projet prouve" />
            <p className="max-w-md text-[15px] leading-relaxed text-rail-400">
              Chaque affirmation renvoie à l&apos;endroit du code où on peut la vérifier. Rien n&apos;est
              décoratif.
            </p>
          </div>

          <ol className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {preuves.map((preuve, index) => (
              <li key={preuve.titre} className={index === 0 ? "lg:col-span-2" : undefined}>
                <a
                  href={`${DEPOT}/blob/main/${preuve.fichier}`}
                  className="carte carte-active group flex h-full flex-col p-6"
                >
                  <span className="flex items-center justify-between">
                    <span className="chiffres flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] font-mono text-[13px] text-signal-400 ring-1 ring-inset ring-white/[0.08]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-rail-600 transition-[color,transform] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-signal-400">
                      <FlecheDiagonale />
                    </span>
                  </span>
                  <h3 className="titre-voie mt-6 text-[21px] text-rail-100">{preuve.titre}</h3>
                  <p className="mt-2.5 flex-1 text-[15px] leading-relaxed text-rail-400">{preuve.detail}</p>
                  <span className="mt-6 inline-flex max-w-full self-start truncate rounded-lg bg-rail-950/70 px-2.5 py-1.5 font-mono text-[12px] text-rail-300 ring-1 ring-inset ring-white/[0.06]">
                    {preuve.fichier}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 03 · Le trajet d'une requête (planche claire) ─────────────── */}
      <section className="px-3 sm:px-5">
        <div className="mx-auto max-w-[80rem] rounded-[28px] bg-plan-50 text-plan-900 shadow-[0_40px_100px_-40px_rgb(0_0_0/0.8)]">
          <div className="mx-auto max-w-[77.5rem] px-5 py-16 sm:px-8 lg:py-20">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="flex items-center gap-3 text-[13px] text-plan-600">
                  <span className="pave-voie !bg-plan-900 !text-signal-400 !shadow-none">03</span>
                  Architecture
                </p>
                <h2 className="titre-voie mt-5 text-[clamp(2rem,3.6vw,3rem)]">
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
        </div>
      </section>

      {/* ── 04 · Les livrables ────────────────────────────────────────── */}
      <section>
        <div className="mx-auto max-w-[77.5rem] px-5 py-20 lg:py-24">
          <EnTete numero="04" surtitre="Les livrables" titre="Trois livrables, un seul contrat" />
          <ul className="mt-12 grid gap-4 md:grid-cols-3">
            {livrables.map((livrable) => (
              <li key={livrable.titre}>
                <Link href={livrable.href} className="carte carte-active group flex h-full flex-col p-6">
                  <span className="flex items-center justify-between">
                    <span className="rounded-full bg-white/[0.04] px-2.5 py-1 font-mono text-[12px] text-rail-300 ring-1 ring-inset ring-white/[0.08]">
                      {livrable.chemin}
                    </span>
                    <span className="text-rail-600 transition-[color,transform] group-hover:translate-x-0.5 group-hover:text-signal-400">
                      <Fleche />
                    </span>
                  </span>
                  <span className="titre-voie mt-10 text-[26px] text-rail-100">{livrable.titre}</span>
                  <span className="mt-2.5 text-[14px] leading-relaxed text-rail-400">{livrable.detail}</span>
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
      <p className="flex items-center gap-3 text-[13px] text-rail-400">
        <span className="pave-voie">{numero}</span>
        {surtitre}
      </p>
      <h2 className="titre-voie mt-5 text-[clamp(2rem,3.6vw,3rem)] text-rail-100">{titre}</h2>
    </div>
  );
}

function Chiffre({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <div className="carte px-4 py-4">
      <dt className="sr-only">{libelle}</dt>
      <dd className="chiffres titre-voie text-[30px] leading-none text-rail-100">{valeur}</dd>
      <dd className="mt-2 text-[12px] leading-snug text-rail-500">{libelle}</dd>
    </div>
  );
}

function Fleche() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlecheDiagonale() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Github() {
  return (
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
