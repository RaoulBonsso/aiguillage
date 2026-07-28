# Le trajet d'une requête authentifiée

Tout appel à l'API v1 traverse la même enveloppe (`src/lib/handler.ts`). Elle est écrite **une
seule fois** : une garantie qu'on réimplémente à chaque route est une garantie qu'on finit par
oublier sur l'une d'elles.

```mermaid
sequenceDiagram
    participant C as Canal de vente
    participant H as withApiKey
    participant S as ApiKeyService
    participant K as KeyStore
    participant M as Métier (search)

    C->>H: GET /api/v1/offers<br/>X-API-Key: agl_live_…
    H->>S: authenticate(secret)
    S->>K: findByPrefix("agl_live_7f3a")
    K-->>S: candidats
    S->>S: comparaison à temps constant<br/>des empreintes SHA-256
    alt clé inconnue ou révoquée
        S-->>H: null
        H-->>C: 401 problem+json
    else clé valide
        S-->>H: clé
        H->>S: consume(id)
        S->>K: lecture + écriture du compteur
        alt quota épuisé
            S-->>H: refus + reset
            H-->>C: 429 + RateLimit-*
        else quota disponible
            S-->>H: autorisé + restant
            H->>M: recherche des offres
            M-->>H: page d'offres
            H->>S: record(opération, statut)
            H-->>C: 200 + RateLimit-*
        end
    end
```

## Les décisions visibles sur ce schéma

**Recherche par préfixe, puis comparaison à temps constant.** On pourrait chercher directement par
empreinte : ce serait plus court, mais la comparaison partirait alors dans le moteur de stockage,
hors de notre contrôle. Ici la vérification du secret est explicite et se fait en temps constant —
comparer avec `===` laisserait fuir, par le temps de réponse, le nombre de caractères devinés.

**Le quota est décompté avant le métier, pas après.** Une requête refusée ne doit rien coûter en
calcul. C'est aussi ce qui permet de renvoyer un `429` sans avoir touché au catalogue.

**Les en-têtes `RateLimit-*` sont posés sur toutes les réponses**, pas seulement sur les refus. Un
intégrateur doit pouvoir ralentir *avant* de se faire refuser, pas après.

**`/me` ne consomme pas de quota.** Demander « combien me reste-t-il ? » ne doit pas en retirer un.
C'est le genre de détail qui ne se voit qu'à l'usage — et qui distingue une API pensée pour ses
consommateurs d'une API pensée pour son auteur.

**Le journal est écrit après la réponse**, avec le statut réel. Il enregistre donc aussi les `404`
et les `429`, qui sont précisément ce qu'un administrateur veut voir quand un canal se plaint.
