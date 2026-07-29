import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Le site se documente à partir du dépôt lui-même.
 *
 * Les noms de tests affichés sont lus dans les fichiers `.test.ts`, les
 * décisions dans le markdown des ADR. Rien n'est recopié à la main : une
 * documentation qui duplique son sujet finit toujours par le contredire.
 *
 * Ces lectures ont lieu au moment du build (les pages concernées sont
 * prérendues), donc elles ne coûtent rien à l'exécution.
 */

const RACINE = process.cwd();

export type SuiteTests = {
  fichier: string;
  chemin: string;
  role: string;
  groupes: Array<{ nom: string; tests: string[] }>;
  total: number;
};

/** À quoi sert chaque suite — la seule chose que le code ne dit pas tout seul. */
const ROLES: Record<string, string> = {
  "catalog.test.ts": "Le catalogue servi satisfait les schémas publiés",
  "search.test.ts": "Filtres, disponibilité selon le groupe, pagination",
  "apikeys.test.ts": "Émission, révocation, quota mensuel, journal",
  "session.test.ts": "Jeton d'administration : valide, altéré, périmé",
  "routes.test.ts": "Tests de contrat : chaque réponse validée par la spec",
};

function fichiersDeTest(dossier: string, trouves: string[] = []): string[] {
  for (const entree of readdirSync(dossier, { withFileTypes: true })) {
    const complet = path.join(dossier, entree.name);
    if (entree.isDirectory()) {
      fichiersDeTest(complet, trouves);
    } else if (entree.name.endsWith(".test.ts") || entree.name.endsWith(".test.tsx")) {
      trouves.push(complet);
    }
  }
  return trouves;
}

/**
 * Extrait les `describe` et `it` d'un fichier de test.
 *
 * Analyse textuelle assumée : un vrai parseur TypeScript serait plus juste,
 * mais ici on lit nos propres fichiers, dont on maîtrise le style. La
 * contrepartie est explicite — si un titre de test contient une apostrophe
 * échappée exotique, il s'affichera tel quel.
 */
function extraire(source: string): SuiteTests["groupes"] {
  const groupes: SuiteTests["groupes"] = [];
  const motif = /\b(describe|it)\(\s*(["'`])((?:\\.|(?!\2)[\s\S])*?)\2/g;

  let correspondance: RegExpExecArray | null;
  while ((correspondance = motif.exec(source)) !== null) {
    const [, genre, , titre] = correspondance;
    const propre = titre.replace(/\\(["'`])/g, "$1");

    if (genre === "describe") {
      groupes.push({ nom: propre, tests: [] });
    } else if (groupes.length > 0) {
      groupes[groupes.length - 1].tests.push(propre);
    } else {
      groupes.push({ nom: "(sans groupe)", tests: [propre] });
    }
  }

  return groupes.filter((groupe) => groupe.tests.length > 0);
}

export function suitesDeTests(): SuiteTests[] {
  return fichiersDeTest(path.join(RACINE, "src"))
    .map((complet) => {
      const relatif = path.relative(RACINE, complet);
      const groupes = extraire(readFileSync(complet, "utf8"));
      return {
        fichier: path.basename(complet),
        chemin: relatif,
        role: ROLES[path.basename(complet)] ?? "",
        groupes,
        total: groupes.reduce((somme, groupe) => somme + groupe.tests.length, 0),
      };
    })
    .sort((a, b) => b.total - a.total);
}

export type Decision = {
  numero: string;
  titre: string;
  decision: string;
  pourquoi: string;
  cout: string;
};

/** Les ADR, lues dans `docs/architecture/03-decisions.md`. */
export function decisions(): Decision[] {
  const source = readFileSync(
    path.join(RACINE, "docs", "architecture", "03-decisions.md"),
    "utf8",
  );

  return source
    .split(/^## /m)
    .slice(1)
    .map((bloc) => {
      const [entete, ...reste] = bloc.split("\n");
      const corps = reste.join("\n");
      const [, numero, titre] = /^(ADR-\d+)\s*—\s*(.+)$/.exec(entete.trim()) ?? [
        "",
        "ADR",
        entete.trim(),
      ];

      return {
        numero,
        titre,
        decision: section(corps, "Décision"),
        pourquoi: section(corps, "Pourquoi"),
        cout: section(corps, "Coût"),
      };
    })
    .filter((decision) => decision.decision !== "");
}

/** Le paragraphe qui suit un intitulé en gras du type `**Pourquoi.**`. */
function section(corps: string, intitule: string): string {
  const motif = new RegExp(`\\*\\*${intitule}[^*]*\\.?\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|\\n---|$)`);
  const trouve = motif.exec(corps);
  return (trouve?.[1] ?? "")
    .replace(/\n+/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/`/g, "")
    .replace(/\*\*/g, "")
    .trim();
}
