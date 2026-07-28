import Link from "next/link";
import { demoSecret } from "@/lib/api-context";
import { offers, stations } from "@/data/catalog";
import { operationsParTheme } from "@/lib/spec-view";

// Le catalogue est un horaire glissant : on régénère la page chaque heure pour
// que les exemples de la doc restent des exemples qui aboutissent.
export const revalidate = 3600;

/**
 * La page d'accueil : ce que fait le produit, à qui il s'adresse, et comment
 * l'essayer en moins d'une minute. Un portail d'API se juge à la vitesse du
 * premier appel réussi.
 */
export default function Accueil() {
  const echantillon = offers.find((offre) => offre.segments.length === 1) ?? offers[0];
  const nombreOperations = operationsParTheme().reduce(
    (total, theme) => total + theme.operations.length,
    0,
  );

  const exemple = [
    `curl "https://votre-instance/api/v1/offers\\`,
    `  ?origin=${echantillon.origin}&destination=${echantillon.destination}&date=${echantillon.departure.slice(0, 10)}" \\`,
    `  -H "X-API-Key: ${demoSecret()}"`,
  ].join("\n");

  return (
    <div className="mx-auto max-w-6xl px-5">
      <section className="py-16 sm:py-24">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
          API-as-a-Product
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
          L&apos;offre ferroviaire, distribuée aux canaux de vente.
        </h1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-rail-300">
          Aiguillage expose horaires, tarifs et disponibilités via une API REST spécifiée en
          OpenAPI. Autour d&apos;elle, les deux outils qui la rendent consommable : un portail de
          documentation généré depuis le contrat, et une console d&apos;administration pour piloter
          les accès.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="rounded-md bg-signal-500 px-4 py-2 text-sm font-medium text-rail-950 transition-opacity hover:opacity-90"
          >
            Lire la documentation
          </Link>
          <Link
            href="/admin"
            className="rounded-md border border-rail-700 px-4 py-2 text-sm font-medium text-rail-100 transition-colors hover:border-rail-600 hover:bg-rail-850"
          >
            Ouvrir la console
          </Link>
        </div>

        <div className="mt-10 max-w-2xl rounded-lg border border-rail-800 bg-rail-900/60 p-4">
          <p className="mb-2 text-[12px] uppercase tracking-wider text-rail-400">
            Premier appel, sans inscription
          </p>
          <pre className="bloc-code text-rail-300">{exemple}</pre>
        </div>
      </section>

      <div className="rail-line" />

      <section className="grid gap-6 py-14 sm:grid-cols-3">
        <Chiffre valeur={String(nombreOperations)} libelle="opérations documentées" />
        <Chiffre valeur={String(stations.length)} libelle="gares au référentiel" />
        <Chiffre valeur={offers.length.toLocaleString("fr-FR")} libelle="offres sur 21 jours" />
      </section>

      <div className="rail-line" />

      <section className="py-14">
        <h2 className="text-2xl font-semibold tracking-tight">La chaîne de distribution</h2>
        <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-rail-300">
          Entre les données brutes d&apos;un transporteur et le voyageur qui achète son billet, il
          y a une chaîne. Aiguillage occupe le maillon du milieu : transformer une offre en produit
          consommable par des canaux tiers.
        </p>

        <ol className="mt-8 grid gap-3 md:grid-cols-4">
          {[
            { titre: "Données brutes", detail: "Horaires, tarifs, conditions" },
            { titre: "Édition de l'offre", detail: "Produits vendables, règles commerciales" },
            { titre: "API + portail + console", detail: "Le périmètre d'Aiguillage", accent: true },
            { titre: "Canaux de vente", detail: "Sites, applis, agences, revendeurs" },
          ].map((etape) => (
            <li
              key={etape.titre}
              className={`rounded-lg border p-4 ${
                etape.accent
                  ? "border-signal-500/40 bg-signal-500/5"
                  : "border-rail-800 bg-rail-900/40"
              }`}
            >
              <p
                className={`text-[14px] font-medium ${
                  etape.accent ? "text-signal-400" : "text-rail-100"
                }`}
              >
                {etape.titre}
              </p>
              <p className="mt-1 text-[13px] leading-snug text-rail-400">{etape.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="rail-line" />

      <section className="py-14">
        <h2 className="text-2xl font-semibold tracking-tight">Comment c&apos;est construit</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Bloc titre="Le contrat d'abord">
            La spec OpenAPI a été écrite avant la première ligne de code. Elle décrit les quatre
            opérations, l&apos;authentification, les quotas et les erreurs — et c&apos;est elle qui
            a guidé l&apos;implémentation, pas l&apos;inverse.
          </Bloc>
          <Bloc titre="Des tests qui interdisent le mensonge">
            Chaque réponse servie est validée contre le schéma publié. Ajouter un champ sans le
            documenter fait tomber la suite de tests : la documentation ne peut pas dériver en
            silence.
          </Bloc>
          <Bloc titre="Un portail qui se régénère">
            Le portail ne contient aucun texte écrit à la main. Il lit le contrat et se met à jour
            tout seul, exemples exécutables compris.
          </Bloc>
        </div>
      </section>
    </div>
  );
}

function Chiffre({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <div>
      <p className="font-mono text-3xl font-semibold text-signal-400">{valeur}</p>
      <p className="mt-1 text-[14px] text-rail-400">{libelle}</p>
    </div>
  );
}

function Bloc({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-rail-800 bg-rail-900/40 p-5">
      <h3 className="text-[15px] font-medium text-rail-100">{titre}</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-rail-400">{children}</p>
    </div>
  );
}
