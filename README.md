# Aiguillage

**Une API de distribution ferroviaire traitée comme un produit** : le contrat OpenAPI d'abord, une
implémentation vérifiée contre lui, un portail de documentation généré depuis ce contrat, et une
console d'administration pour piloter les accès.

> Démonstration technique. Transporteurs, lignes et tarifs sont fictifs.

---

## Ce que ça fait

Entre les données brutes d'un transporteur et le voyageur qui achète son billet, il y a une chaîne
de distribution. Aiguillage occupe le maillon du milieu : exposer horaires, tarifs et
disponibilités à des **canaux de vente tiers** — sites, applications, agences, revendeurs.

Trois livrables, comme dans une vraie équipe « API-as-a-Product » :

| Livrable | Où | Ce que c'est |
|---|---|---|
| **L'API v1** | `/api/v1` | 4 opérations REST, auth par clé, quotas, erreurs RFC 9457 |
| **Le portail de doc** | `/docs` | Généré depuis `spec/openapi.yaml`, exemples exécutables en direct |
| **La console d'admin** | `/admin` | Émission/révocation des clés, suivi des quotas, journal d'appels |

## Démarrer

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # 53 tests
```

Premier appel, avec la clé du bac à sable :

```bash
curl "http://localhost:3000/api/v1/offers?origin=FRPAR&destination=FRNTE&date=$(date -d '+3 days' +%F)" \
  -H "X-API-Key: agl_live_demo00000000000000000000000000"
```

La console d'administration est sur `/admin` — en mode démonstration, le mot de passe est affiché
sur l'écran de connexion.

## Ce qui rend ce projet différent d'un CRUD

### Le contrat a été écrit avant le code

`spec/openapi.yaml` est commité **avant** le premier handler — l'historique git le montre. La spec
décrit les quatre opérations, l'authentification, la pagination, les quotas et les erreurs. Le code
est ensuite venu la satisfaire.

### La documentation ne peut pas mentir

Les tests d'API ne valident pas les réponses contre les attentes du développeur, mais contre **les
schémas publiés dans la spec** (via Ajv). Servir un champ non documenté, ou en retirer un, fait
tomber la suite. Le portail, lui, ne contient aucun texte écrit à la main : il lit le contrat.

C'est la boucle complète du *Spec Driven Development* : une seule source de vérité, vérifiée
mécaniquement des deux côtés.

### Les garanties sont écrites une fois

L'authentification, le décompte de quota, les en-têtes `RateLimit-*` et le journal d'usage vivent
dans une enveloppe unique (`src/lib/handler.ts`). Aucune route ne les réimplémente — donc aucune
route ne peut les oublier.

### Le domaine ne connaît ni HTTP ni base de données

`src/domain/` se teste sans serveur et sans stockage. D'où une suite complète qui tourne en moins
d'une seconde, et un changement de persistance qui ne touche aucune règle métier.

## Architecture

- [Vue d'ensemble](docs/architecture/01-vue-ensemble.md) — le métier, les trois couches, ce que le
  découpage interdit
- [Trajet d'une requête authentifiée](docs/architecture/02-requete-authentifiee.md) — diagramme de
  séquence et décisions visibles dessus
- [Décisions d'architecture](docs/architecture/03-decisions.md) — six ADR, chacune avec son coût

## Tests

```
src/data/catalog.test.ts       8 tests   le catalogue satisfait les schémas publiés
src/domain/search.test.ts     12 tests   filtres, disponibilité, pagination, référentiel
src/domain/apikeys.test.ts    11 tests   émission, révocation, quota mensuel, journal
src/lib/session.test.ts        5 tests   jeton valide, altéré, bricolé, périmé, malformé
src/app/api/v1/routes.test.ts 17 tests   tests de contrat des quatre opérations
```

## Limite assumée

Le stockage des clés est **en mémoire** : les clés émises depuis la console ne survivent pas au
redémarrage du processus. C'est un choix explicite (voir [ADR-3](docs/architecture/03-decisions.md)) —
l'objet du projet est la chaîne API + portail + console, pas le choix d'une base. L'interface
`KeyStore` a été dessinée pour recevoir un adaptateur durable : sept méthodes, aucune logique
métier.

## Pile

Next.js 16 (App Router) · TypeScript · Zod · Ajv · Vitest · Tailwind CSS v4

## Variables d'environnement

Toutes optionnelles — sans elles, l'application tourne en mode démonstration.

| Variable | Rôle |
|---|---|
| `AIGUILLAGE_ADMIN_PASSWORD` | Mot de passe de la console. Absent = mode démo, mot de passe affiché à l'écran. |
| `AIGUILLAGE_SESSION_SECRET` | Secret de signature des sessions d'administration. |
| `AIGUILLAGE_DEMO_KEY` | Clé du bac à sable public utilisée par le portail. |
| `AIGUILLAGE_DEMO_QUOTA` | Quota mensuel de cette clé (défaut : 500). |
