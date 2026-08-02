# Documentation d'Aiguillage

## Par où commencer

**Tu découvres le projet.** Lis [Comprendre Aiguillage, de zéro](comprendre-aiguillage.md). Le
problème métier, tout le vocabulaire expliqué terme par terme, le fonctionnement de bout en bout et
les limites assumées. C'est le seul document qui ne suppose aucun prérequis.

**Tu veux juger la conception.** Commence par la [vue d'ensemble](architecture/01-vue-ensemble.md),
puis les [décisions](architecture/03-decisions.md) — chacune affiche son coût.

**Tu veux voir la méthode.** [Le contrat d'abord](architecture/05-le-contrat-d-abord.md) montre
comment la documentation devient mécaniquement impossible à désynchroniser, et ce qui casse quand on
triche.

## Tous les documents

| Document | Contenu | Diagrammes |
|---|---|---|
| [Comprendre Aiguillage, de zéro](comprendre-aiguillage.md) | Le projet expliqué sans prérequis : métier, vocabulaire, bout en bout, limites | 3 |
| [Vue d'ensemble](architecture/01-vue-ensemble.md) | Le métier, les trois couches, ce que le découpage interdit | 2 |
| [Le trajet d'une requête authentifiée](architecture/02-requete-authentifiee.md) | Séquence complète et décisions visibles dessus | 1 |
| [Décisions d'architecture](architecture/03-decisions.md) | Six ADR, chacune avec son coût assumé | — |
| [Le cycle de vie d'une clé](architecture/04-cycle-de-vie-cle.md) | États, transitions, gestion du secret, temps constant | 2 |
| [Le contrat d'abord](architecture/05-le-contrat-d-abord.md) | Spec Driven Development, la boucle, ce qui casse quand on triche | 3 |
| [Fiche d'entretien](demo-entretien.md) | Démo minutée, questions pièges, limites à assumer | — |

Les diagrammes sont écrits en [Mermaid](https://mermaid.js.org/) directement dans le markdown : GitHub
les affiche nativement, et ils se relisent en diff comme du code — un schéma exporté en image devient
faux sans que personne ne le voie.

## Voir tourner le projet

| | |
|---|---|
| Démonstration en ligne | https://aiguillage-delta.vercel.app |
| Portail de documentation | https://aiguillage-delta.vercel.app/docs |
| Guide technique interactif | https://aiguillage-delta.vercel.app/guide |
| Le contrat brut | https://aiguillage-delta.vercel.app/api/openapi |
