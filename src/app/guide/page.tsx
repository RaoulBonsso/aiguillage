import type { Metadata } from "next";
import Link from "next/link";
import { decisions, suitesDeTests } from "@/lib/repo-insights";
import { ChaineDistribution } from "@/components/viz/ChaineDistribution";
import { Couches } from "@/components/viz/Couches";
import { CycleRequete } from "@/components/viz/CycleRequete";
import { SourceDeVerite } from "@/components/viz/SourceDeVerite";
import { CarteTests } from "@/components/viz/CarteTests";
import { CartesDecisions } from "@/components/viz/CartesDecisions";
import { Chronologie, type Commit } from "@/components/viz/Chronologie";
import { NavGuide } from "@/components/viz/NavGuide";
import historique from "@/data/historique.json";
import { operationsParTheme } from "@/lib/spec-view";

export const metadata: Metadata = {
  title: "Guide technique",
  description:
    "Comment Aiguillage est construit : la chaîne de distribution, le contrat comme source de vérité, les trois couches, le cycle d'une requête, les décisions et leurs coûts.",
};

const sections = [
  { id: "probleme", titre: "Le problème" },
  { id: "methode", titre: "Le contrat d'abord" },
  { id: "preuve", titre: "La preuve par l'historique" },
  { id: "architecture", titre: "Les trois couches" },
  { id: "requete", titre: "Le cycle d'une requête" },
  { id: "decisions", titre: "Les décisions" },
  { id: "tests", titre: "Les tests" },
  { id: "essayer", titre: "Essayer" },
];

/**
 * Le guide technique.
 *
 * Il ne raconte pas ce que fait le code — le code le dit déjà. Il raconte
 * **pourquoi** il est découpé ainsi, et ce que chaque choix a coûté. Les
 * chiffres, les tests et l'historique sont lus dans le dépôt au moment du
 * build : cette page ne peut pas devenir fausse sans que le dépôt le soit.
 */
export default function GuidePage() {
  const suites = suitesDeTests();
  const adr = decisions();
  const commits = historique.commits as Commit[];
  const totalTests = suites.reduce((somme, suite) => somme + suite.total, 0);
  const testsDeContrat = suites.find((suite) => suite.fichier === "routes.test.ts")?.total ?? 0;
  const operations = operationsParTheme().reduce(
    (total, theme) => total + theme.operations.length,
    0,
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <header className="max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
          Guide technique
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-[1.12] tracking-tight">
          Ce qu&apos;il y a sous le portail.
        </h1>
        <p className="mt-5 text-[17px] leading-relaxed text-rail-300">
          Aiguillage tient en une idée : le contrat d&apos;API est le produit, tout le reste en
          découle. Cette page montre comment cette idée se traduit en découpage de code, en tests,
          et en décisions assumées — avec leurs inconvénients.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Mesure valeur={String(operations)} libelle="opérations au contrat" />
          <Mesure valeur={String(totalTests)} libelle="tests automatisés" />
          <Mesure valeur={String(testsDeContrat)} libelle="tests de contrat" />
          <Mesure valeur={String(adr.length)} libelle="décisions documentées" />
        </dl>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-[14rem_1fr]">
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <NavGuide sections={sections} />
        </aside>

        <div className="min-w-0 space-y-20">
          <Section
            id="probleme"
            numero="01"
            titre="Le problème : faire circuler une offre"
            chapeau="Avant la technique, le métier. Une API de distribution n'existe que parce qu'une information commerciale doit voyager du transporteur jusqu'au voyageur, en traversant des acteurs qui ne se connaissent pas."
          >
            <ChaineDistribution />
          </Section>

          <Section
            id="methode"
            numero="02"
            titre="Le contrat est la source de vérité"
            chapeau="La spec OpenAPI n'est pas une documentation produite après coup : c'est le fichier dont tout le reste dépend. Trois consommateurs s'y branchent, et chacun rend un type de dérive impossible."
          >
            <SourceDeVerite />
          </Section>

          <Section
            id="preuve"
            numero="03"
            titre="La preuve par l'historique"
            chapeau="Tout le monde dit travailler « spec first ». L'ordre des commits, lui, ne se raconte pas."
          >
            <Chronologie commits={commits} />
          </Section>

          <Section
            id="architecture"
            numero="04"
            titre="Trois couches, définies par leur ignorance"
            chapeau="On décrit d'habitude une architecture par ce que chaque couche sait faire. La question utile est l'inverse : qu'est-ce qu'elle ignore ? C'est l'ignorance qui rend un module testable et remplaçable."
          >
            <Couches />
          </Section>

          <Section
            id="requete"
            numero="05"
            titre="Le cycle d'une requête, pas à pas"
            chapeau="Huit étapes entre l'appel d'un canal de vente et sa réponse. À chacune, ce qui se passe quand tout va bien — et ce qui se passe quand ça casse."
          >
            <CycleRequete />
          </Section>

          <Section
            id="decisions"
            numero="06"
            titre="Les décisions, et ce qu'elles coûtent"
            chapeau="Lues directement dans docs/architecture/03-decisions.md. Chacune affiche son inconvénient : une décision sans coût est une décision qu'on n'a pas vraiment prise."
          >
            <CartesDecisions decisions={adr} />
          </Section>

          <Section
            id="tests"
            numero="07"
            titre="Ce que les tests garantissent réellement"
            chapeau="Les titres ci-dessous sont extraits des fichiers de test au moment du build. Ce n'est pas une liste d'intentions : c'est ce qui tourne."
          >
            <CarteTests suites={suites} />
          </Section>

          <Section
            id="essayer"
            numero="08"
            titre="Essayer par soi-même"
            chapeau="La meilleure façon de juger une API reste de l'appeler."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Carte
                href="/docs"
                titre="Le portail"
                detail="Quatre opérations, leurs schémas, et un bouton « Envoyer » qui appelle l'API en direct."
              />
              <Carte
                href="/admin"
                titre="La console"
                detail="Émettre une clé, la révoquer, voir le quota se remplir et le journal se garnir."
              />
              <Carte
                href="/api/openapi"
                titre="Le contrat brut"
                detail="Le fichier openapi.yaml tel qu'il est servi aux intégrateurs."
              />
            </div>

            <div className="mt-6 rounded-xl border border-rail-800 bg-rail-900/40 p-5">
              <p className="mb-2 text-[12px] uppercase tracking-wider text-rail-400">
                Ou depuis un terminal
              </p>
              <pre className="bloc-code text-rail-300">
{`curl "https://aiguillage-delta.vercel.app/api/v1/stations?q=paris" \\
  -H "X-API-Key: agl_live_demo00000000000000000000000000"`}
              </pre>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  numero,
  titre,
  chapeau,
  children,
}: {
  id: string;
  numero: string;
  titre: string;
  chapeau: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <div className="mb-6 max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-wider text-signal-500">{numero}</p>
        <h2 className="mt-1.5 text-2xl font-semibold tracking-tight">{titre}</h2>
        <p className="mt-2.5 text-[15px] leading-relaxed text-rail-300">{chapeau}</p>
      </div>
      {children}
    </section>
  );
}

function Mesure({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <div>
      <dt className="sr-only">{libelle}</dt>
      <dd>
        <span className="block font-mono text-2xl font-semibold text-signal-400">{valeur}</span>
        <span className="mt-0.5 block text-[13px] leading-snug text-rail-400">{libelle}</span>
      </dd>
    </div>
  );
}

function Carte({ href, titre, detail }: { href: string; titre: string; detail: string }) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-rail-800 bg-rail-900/40 p-4 transition-colors hover:border-signal-500/50 hover:bg-rail-900/70"
    >
      <p className="text-[15px] font-medium text-rail-100 group-hover:text-signal-400">
        {titre} <span aria-hidden>→</span>
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-rail-400">{detail}</p>
    </Link>
  );
}
