import type { Metadata } from "next";
import { Deck, type Diapo } from "@/components/deck/Deck";
import { DemoEnDirect } from "@/components/deck/DemoEnDirect";
import { suitesDeTests } from "@/lib/repo-insights";
import historique from "@/data/historique.json";
import { operationsParTheme } from "@/lib/spec-view";
import { offers, stations } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Présentation",
  description:
    "Aiguillage en douze diapositives : le problème, la méthode spec-first, l'architecture, et une démonstration appelée en direct.",
};

/**
 * La présentation.
 *
 * Elle est faite pour être projetée pendant un entretien : navigation au
 * clavier, une idée par diapositive, et une démonstration qui appelle vraiment
 * l'API plutôt que d'en montrer une capture d'écran.
 */
export default function PresentationPage() {
  const suites = suitesDeTests();
  const totalTests = suites.reduce((somme, suite) => somme + suite.total, 0);
  const testsContrat = suites.find((suite) => suite.fichier === "routes.test.ts")?.total ?? 0;
  const commits = historique.commits;
  const indexSpec = commits.findIndex((commit) => commit.titre.includes("contrat OpenAPI"));
  const indexApi = commits.findIndex((commit) => commit.portee === "api");
  const operations = operationsParTheme().reduce((t, theme) => t + theme.operations.length, 0);

  const diapos: Diapo[] = [
    {
      cle: "titre",
      titre: "Aiguillage",
      contenu: (
        <div>
          <p className="etiquette flex items-center gap-3 text-rail-400">
            <span className="pave-voie">05</span>
            API-as-a-Product
          </p>
          <h1 className="titre-voie mt-7 text-[clamp(4rem,10vw,8.5rem)] text-rail-100">
            Aiguillage
          </h1>
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-rail-300">
            Une API de distribution ferroviaire, son portail de documentation et sa console
            d&apos;administration. Le contrat écrit avant le code, et vérifié par les tests.
          </p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[14px] text-rail-400">
            <span>
              <strong className="text-rail-100">{operations}</strong> opérations
            </span>
            <span>
              <strong className="text-rail-100">{totalTests}</strong> tests
            </span>
            <span>
              <strong className="text-rail-100">{commits.length}</strong> commits
            </span>
            <span>Next.js 16 · TypeScript · Vitest</span>
          </div>
          <p className="mt-12 text-[13px] text-rail-600">
            Flèches ou espace pour avancer · <kbd className="font-mono">O</kbd> pour le sommaire
          </p>
        </div>
      ),
    },
    {
      cle: "probleme",
      titre: "Le problème",
      contenu: (
        <div>
          <Titre>Une information commerciale doit voyager</Titre>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-rail-300">
            Un transporteur possède des horaires, des tarifs et des places. Un voyageur veut
            acheter un billet. Entre les deux, il y a des canaux de vente qui ne connaissent rien
            aux systèmes internes du transporteur.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-2 text-[14px]">
            {["Données brutes", "Édition de l'offre", "Aiguillage", "Canaux de vente", "Voyageur"].map(
              (etape, rang) => (
                <span key={etape} className="flex items-center gap-2">
                  <span
                    className={`rounded-lg border px-3.5 py-2 ${
                      etape === "Aiguillage"
                        ? "border-signal-500 bg-signal-500/10 text-signal-400"
                        : "border-rail-800 bg-rail-900/50 text-rail-300"
                    }`}
                  >
                    {etape}
                  </span>
                  {rang < 4 ? (
                    <span aria-hidden className="text-rail-600">
                      →
                    </span>
                  ) : null}
                </span>
              ),
            )}
          </div>
          <p className="mt-10 max-w-3xl border-l-2 border-signal-500/50 pl-4 text-lg leading-relaxed text-rail-200">
            Le maillon du milieu ne transporte pas de la donnée : il en fait un{" "}
            <strong className="text-rail-100">produit consommable par des tiers</strong>.
          </p>
        </div>
      ),
    },
    {
      cle: "perimetre",
      titre: "Trois livrables",
      contenu: (
        <div>
          <Titre>Une API seule ne se consomme pas</Titre>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-rail-300">
            Traiter une API comme un produit, c&apos;est livrer les deux outils sans lesquels
            personne ne peut s&apos;en servir.
          </p>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {[
              {
                titre: "L'API",
                chemin: "/api/v1",
                detail: `${operations} opérations REST, authentification par clé, quotas, erreurs RFC 9457.`,
              },
              {
                titre: "Le portail",
                chemin: "/docs",
                detail: "Généré depuis le contrat. Aucune phrase écrite à la main, exemples exécutables.",
              },
              {
                titre: "La console",
                chemin: "/admin",
                detail: "Émission et révocation des clés, suivi des quotas, journal des appels.",
              },
            ].map((bloc) => (
              <div key={bloc.titre} className="rounded-xl border border-rail-800 bg-rail-900/50 p-5">
                <p className="text-[17px] font-medium text-rail-100">{bloc.titre}</p>
                <code className="mt-1 block font-mono text-[12px] text-signal-400">{bloc.chemin}</code>
                <p className="mt-3 text-[14px] leading-relaxed text-rail-400">{bloc.detail}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      cle: "methode",
      titre: "La méthode : le contrat d'abord",
      contenu: (
        <div>
          <Titre>Le contrat avant le code</Titre>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-rail-300">
            Écrire la spec en premier force à répondre tout de suite aux questions qu&apos;on
            repousse d&apos;habitude : comment on pagine, à quoi ressemble une erreur, quel champ
            est obligatoire, que se passe-t-il au dépassement de quota.
          </p>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-rail-300">
            Ces réponses coûtent une heure avant le code. Après, elles coûtent une migration.
          </p>

          {indexSpec >= 0 && indexApi > indexSpec ? (
            <div className="mt-9 rounded-xl border border-signal-500/30 bg-signal-500/5 p-5">
              <p className="text-[12px] uppercase tracking-wider text-signal-500">
                Vérifiable dans l&apos;historique
              </p>
              <div className="mt-3 space-y-2 font-mono text-[13px]">
                <p className="text-rail-200">
                  <span className="text-rail-600">{commits[indexSpec].hash}</span>{" "}
                  <span className="text-violet-400">docs(spec)</span> {commits[indexSpec].titre}
                </p>
                <p className="pl-4 text-[12px] text-rail-500">
                  ↓ {indexApi - indexSpec} commits plus tard
                </p>
                <p className="text-rail-200">
                  <span className="text-rail-600">{commits[indexApi].hash}</span>{" "}
                  <span className="text-vert-500">feat(api)</span> {commits[indexApi].titre}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      cle: "boucle",
      titre: "La boucle qui interdit la dérive",
      contenu: (
        <div>
          <Titre>Une documentation ne peut pas mentir si elle est exécutée</Titre>
          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-3">
              {[
                {
                  titre: "openapi.yaml",
                  detail: "La source de vérité, versionnée dans le dépôt.",
                  accent: true,
                },
                {
                  titre: "Les tests",
                  detail: `${testsContrat} tests valident chaque réponse contre les schémas publiés, via Ajv.`,
                },
                {
                  titre: "Le portail",
                  detail: "Lit le même fichier. Il n'existe pas de second texte à maintenir.",
                },
              ].map((bloc) => (
                <div
                  key={bloc.titre}
                  className={`rounded-lg border p-4 ${
                    bloc.accent
                      ? "border-signal-500/50 bg-signal-500/10"
                      : "border-rail-800 bg-rail-900/50"
                  }`}
                >
                  <p
                    className={`font-mono text-[14px] ${
                      bloc.accent ? "text-signal-400" : "text-rail-100"
                    }`}
                  >
                    {bloc.titre}
                  </p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-rail-400">{bloc.detail}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-rail-800 bg-rail-950 p-5">
              <p className="text-[12px] uppercase tracking-wider text-rail-400">
                Ce qui se passe si j&apos;ajoute un champ sans le documenter
              </p>
              <pre className="bloc-code mt-3 text-rail-300">
{`FAIL  src/app/api/v1/routes.test.ts
  → sert des offres conformes au schéma publié

  AssertionError: expected [ '/data/0 must NOT have
  additional properties' ] to deeply equal []`}
              </pre>
              <p className="mt-4 text-[14px] leading-relaxed text-rail-300">
                <code className="font-mono text-signal-400">additionalProperties: false</code> rend
                l&apos;ajout silencieux impossible. Les champs requis rendent le retrait impossible.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      cle: "architecture",
      titre: "L'architecture",
      contenu: (
        <div>
          <Titre>Trois couches, définies par ce qu&apos;elles ignorent</Titre>
          <div className="mt-8 space-y-3">
            {[
              {
                nom: "Frontière HTTP",
                chemin: "src/app",
                ignore: "ne sait pas filtrer une offre, ni compter un quota",
              },
              {
                nom: "Domaine",
                chemin: "src/domain",
                ignore: "ne sait pas qu'HTTP existe, ni qu'une base de données existe",
              },
              {
                nom: "Adaptateurs",
                chemin: "src/data",
                ignore: "ne sait pas ce qu'est un quota, ni pourquoi on lui demande ces données",
              },
            ].map((couche) => (
              <div
                key={couche.nom}
                className="flex flex-wrap items-baseline gap-x-4 gap-y-1 rounded-lg border border-rail-800 bg-rail-900/40 px-5 py-4"
              >
                <span className="text-[17px] font-medium text-rail-100">{couche.nom}</span>
                <code className="font-mono text-[12px] text-rail-500">{couche.chemin}</code>
                <span className="w-full text-[14px] text-rail-400 sm:w-auto sm:flex-1 sm:text-right">
                  {couche.ignore}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl border-l-2 border-signal-500/50 pl-4 text-lg leading-relaxed text-rail-200">
            C&apos;est l&apos;ignorance qui rend un module testable. Le domaine se teste{" "}
            <strong className="text-rail-100">sans serveur et sans base</strong> — la suite complète
            tourne en moins d&apos;une seconde, donc je la lance en permanence.
          </p>
        </div>
      ),
    },
    {
      cle: "decisions-requete",
      titre: "Quatre décisions dans une seule requête",
      contenu: (
        <div>
          <Titre>Ce qu&apos;une requête traverse</Titre>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              {
                titre: "Recherche par préfixe, puis comparaison à temps constant",
                detail:
                  "Comparer des empreintes avec === laisserait fuir, par le temps de réponse, le nombre de caractères devinés.",
              },
              {
                titre: "Le quota est décompté avant le métier",
                detail:
                  "Une requête refusée ne doit rien coûter en calcul. Et le 429 part sans avoir touché au catalogue.",
              },
              {
                titre: "Les en-têtes RateLimit-* sur toutes les réponses",
                detail:
                  "Un intégrateur doit pouvoir ralentir avant de se faire refuser, pas après.",
              },
              {
                titre: "/me ne consomme pas de quota",
                detail:
                  "Demander « combien me reste-t-il ? » ne doit pas en retirer un. Le genre de détail qui ne se voit qu'à l'usage.",
              },
            ].map((bloc) => (
              <div key={bloc.titre} className="rounded-xl border border-rail-800 bg-rail-900/40 p-5">
                <p className="text-[15px] font-medium leading-snug text-rail-100">{bloc.titre}</p>
                <p className="mt-2 text-[14px] leading-relaxed text-rail-400">{bloc.detail}</p>
              </div>
            ))}
          </div>
          <p className="mt-7 text-[14px] text-rail-500">
            Tout cela vit dans une enveloppe unique — aucune route ne le réimplémente, donc aucune
            route ne peut l&apos;oublier.
          </p>
        </div>
      ),
    },
    {
      cle: "demo",
      titre: "Démonstration en direct",
      contenu: (
        <div>
          <Titre>L&apos;API, appelée maintenant</Titre>
          <p className="mt-3 mb-7 max-w-3xl text-[15px] leading-relaxed text-rail-400">
            Pas de capture d&apos;écran : chaque bouton appelle la production. Si l&apos;API tombe,
            cette diapositive tombe avec elle.
          </p>
          <DemoEnDirect />
        </div>
      ),
    },
    {
      cle: "donnees",
      titre: "Le catalogue",
      contenu: (
        <div>
          <Titre>Un horaire qui ne périme pas</Titre>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed text-rail-300">
            Le catalogue n&apos;est pas un fichier de données figé : il est généré à partir d&apos;un
            graphe de lignes, sur 21 jours glissants, de façon déterministe.
          </p>
          <div className="mt-9 grid gap-5 sm:grid-cols-3">
            <Mesure valeur={offers.length.toLocaleString("fr-FR")} libelle="offres au catalogue" />
            <Mesure valeur={String(stations.length)} libelle="gares desservies" />
            <Mesure valeur="21" libelle="jours d'horaire glissant" />
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-rail-800 bg-rail-900/40 p-5">
              <p className="text-[15px] font-medium text-rail-100">Déterministe</p>
              <p className="mt-2 text-[14px] leading-relaxed text-rail-400">
                La disponibilité et les prix sont tirés d&apos;un hachage de l&apos;identifiant
                d&apos;offre. Deux exécutions donnent le même catalogue — sinon les tests ne
                voudraient rien dire.
              </p>
            </div>
            <div className="rounded-xl border border-rail-800 bg-rail-900/40 p-5">
              <p className="text-[15px] font-medium text-rail-100">Fidèle au métier</p>
              <p className="mt-2 text-[14px] leading-relaxed text-rail-400">
                Le prix monte aux heures de pointe, le tarif éco disparaît des trains tendus, et un
                train complet reste dans les résultats : au canal de vente de le griser, pas à
                l&apos;API de le cacher.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      cle: "limites",
      titre: "Les limites, assumées",
      contenu: (
        <div>
          <Titre>Ce que ce projet n&apos;est pas</Titre>
          <div className="mt-8 space-y-4">
            {[
              {
                titre: "Le stockage des clés est en mémoire",
                detail:
                  "Choix documenté (ADR-3). L'objet du projet est la chaîne API + portail + console, pas le choix d'une base. Le stockage est isolé derrière une interface de sept méthodes sans logique métier : brancher Firestore ou Postgres ne touche aucune règle.",
              },
              {
                titre: "Le catalogue est fictif",
                detail:
                  "Compagnies, lignes et tarifs sont inventés. C'est une démonstration technique, pas la reprise de l'offre d'un transporteur réel.",
              },
              {
                titre: "Pas de versionnage d'API",
                detail:
                  "Le préfixe /v1 existe, mais la stratégie de changement cassant reste à écrire. C'est le premier sujet que j'ouvrirais sur une vraie API consommée par des tiers.",
              },
            ].map((bloc) => (
              <div key={bloc.titre} className="border-l-2 border-rail-700 pl-4">
                <p className="text-[16px] font-medium text-rail-100">{bloc.titre}</p>
                <p className="mt-1.5 max-w-3xl text-[14px] leading-relaxed text-rail-400">
                  {bloc.detail}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-9 max-w-3xl text-[15px] leading-relaxed text-rail-300">
            Dire les limites avant qu&apos;on les demande, c&apos;est la seule façon de rendre le
            reste crédible.
          </p>
        </div>
      ),
    },
    {
      cle: "prouve",
      titre: "Ce que ça prouve",
      contenu: (
        <div>
          <Titre>Ce que j&apos;ai appris en le construisant</Titre>
          <div className="mt-8 space-y-5">
            {[
              "Un contrat d'API se conçoit avant le code, et se vérifie mécaniquement après.",
              "Une garantie transversale s'écrit une fois, ou elle finit par manquer quelque part.",
              "Un domaine qui ignore HTTP et le stockage se teste en millisecondes.",
              "Un test bien écrit trouve les bugs qu'on ne cherchait pas — Date.parse accepte le 31 février.",
            ].map((ligne, rang) => (
              <p key={ligne} className="flex gap-4 text-lg leading-relaxed text-rail-200">
                <span className="font-mono text-[14px] text-signal-500">
                  {String(rang + 1).padStart(2, "0")}
                </span>
                {ligne}
              </p>
            ))}
          </div>
        </div>
      ),
    },
    {
      cle: "fin",
      titre: "Explorer",
      contenu: (
        <div>
          <Titre>À explorer</Titre>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              { href: "/docs", titre: "Le portail de documentation", detail: "Généré depuis le contrat, essayable en direct." },
              { href: "/guide", titre: "Le guide technique", detail: "Diagrammes interactifs, décisions et coûts, carte des tests." },
              { href: "/admin", titre: "La console d'administration", detail: "Émettre une clé, la révoquer, suivre les quotas." },
              { href: "/api/openapi", titre: "Le contrat brut", detail: "Le fichier openapi.yaml servi aux intégrateurs." },
            ].map((lien) => (
              <a
                key={lien.href}
                href={lien.href}
                className="group rounded-xl border border-rail-800 bg-rail-900/40 p-5 transition-colors hover:border-signal-500/50"
              >
                <p className="text-[16px] font-medium text-rail-100 group-hover:text-signal-400">
                  {lien.titre} <span aria-hidden>→</span>
                </p>
                <p className="mt-1.5 text-[14px] text-rail-400">{lien.detail}</p>
              </a>
            ))}
          </div>
          <p className="mt-10 text-[14px] text-rail-500">
            Merci. Les questions sont la partie intéressante.
          </p>
        </div>
      ),
    },
  ];

  return <Deck diapos={diapos} />;
}

function Titre({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="titre-voie max-w-4xl text-[clamp(2.2rem,4.4vw,3.6rem)] text-rail-100">
      {children}
    </h2>
  );
}

function Mesure({ valeur, libelle }: { valeur: string; libelle: string }) {
  return (
    <div>
      <p className="chiffres titre-voie text-[52px] text-rail-100">{valeur}</p>
      <p className="mt-1 text-[14px] text-rail-400">{libelle}</p>
    </div>
  );
}
