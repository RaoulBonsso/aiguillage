# Vue d'ensemble

## Le problème métier

Dans la distribution ferroviaire, l'information commerciale — horaires, tarifs, disponibilités,
conditions d'échange — doit voyager du transporteur jusqu'aux canaux qui vendent réellement les
billets : sites grand public, applications, agences de voyage, revendeurs tiers.

Aiguillage occupe le maillon du milieu : transformer une offre en **produit consommable par des
tiers**. Ce n'est pas qu'une API — c'est une API *plus* les deux outils sans lesquels personne ne
peut s'en servir : un portail de documentation et une console d'administration.

```mermaid
flowchart LR
    A[Données brutes<br/>horaires · tarifs] --> B[Édition de l'offre<br/>produits vendables]
    B --> C{{Aiguillage}}
    C --> D[Canaux de vente<br/>sites · applis · agences]
    D --> E[Voyageur]

    subgraph C[Périmètre d'Aiguillage]
        C1[API REST v1]
        C2[Portail de doc]
        C3[Console d'admin]
        C1 -.contrat OpenAPI.-> C2
        C1 -.clés · quotas.-> C3
    end
```

## Les trois couches du code

La règle est simple : **le métier ne connaît pas HTTP, et HTTP ne connaît pas le stockage.**

```mermaid
flowchart TB
    subgraph Frontière["Frontière HTTP — src/app"]
        R1[route handlers v1]
        R2[portail /docs]
        R3[console /admin]
    end

    subgraph Domaine["Domaine — src/domain"]
        D1[search.ts<br/>filtres · pagination]
        D2[apikeys.ts<br/>émission · quota]
        D3[ports.ts<br/>interfaces]
    end

    subgraph Données["Adaptateurs — src/data"]
        S1[catalog.ts<br/>horaire généré]
        S2[key-store-memory.ts]
        S3[(adaptateur durable<br/>à brancher)]
    end

    C[/spec/openapi.yaml/]

    R1 --> D1 & D2
    R2 --> C
    R3 --> D2
    D2 --> D3
    D3 -.implémenté par.-> S2
    D3 -.implémenté par.-> S3
    D1 --> S1
    R1 -. validé contre .-> C
```

Conséquences concrètes :

- `search.ts` et `apikeys.ts` se testent **sans serveur, sans base, en millisecondes**. C'est ce qui
  permet d'avoir une suite complète qui tourne en moins d'une seconde.
- Changer de stockage revient à écrire une classe qui satisfait `KeyStore`. Aucune règle métier
  n'est touchée.
- Le contrat OpenAPI est lu à deux endroits : par le portail (pour l'afficher) et par les tests
  (pour valider les réponses). Il n'est jamais recopié.

## Ce que le découpage interdit

| Tentation | Ce qui l'empêche |
|---|---|
| Documenter un champ qu'on ne sert pas | Les tests de contrat valident chaque réponse contre le schéma publié |
| Servir un champ non documenté | `additionalProperties: false` sur les schémas de la spec |
| Oublier les en-têtes de quota sur une route | L'enveloppe `withApiKey` les pose, aucune route ne les écrit |
| Contourner la garde de session en appelant l'action directement | Chaque action serveur revérifie la session |
