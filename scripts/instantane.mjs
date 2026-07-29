#!/usr/bin/env node
/**
 * Fige un instantané de l'historique git dans `src/data/historique.json`.
 *
 * Le site s'en sert pour montrer que le contrat OpenAPI a été commité avant le
 * premier handler. On ne peut pas lire `.git` depuis la plateforme de
 * déploiement, donc on génère le fichier ici et on le commite — avec le SHA de
 * chaque commit, pour que la démonstration reste vérifiable dans le vrai repo.
 *
 * Régénération : `npm run instantane`
 */

import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";

const SEPARATEUR = "";

const brut = execSync(
  `git log --reverse --date=iso-strict --format="%h${SEPARATEUR}%ad${SEPARATEUR}%s"`,
  { encoding: "utf8" },
);

const commits = brut
  .trim()
  .split("\n")
  .map((ligne) => {
    const [hash, date, sujet] = ligne.split(SEPARATEUR);
    const correspondance = /^(\w+)(?:\(([^)]+)\))?: (.+)$/.exec(sujet ?? "");
    return {
      hash,
      date,
      sujet,
      type: correspondance?.[1] ?? "autre",
      portee: correspondance?.[2] ?? null,
      titre: correspondance?.[3] ?? sujet,
    };
  })
  .filter((commit) => !commit.sujet.startsWith("Initial commit"));

const destination = path.join(process.cwd(), "src", "data", "historique.json");
mkdirSync(path.dirname(destination), { recursive: true });
writeFileSync(
  destination,
  `${JSON.stringify({ genere_le: new Date().toISOString(), commits }, null, 2)}\n`,
  "utf8",
);

console.log(`${commits.length} commits écrits dans src/data/historique.json`);
