# Fiche d'entretien — Tesmo, mardi 4 août

Poste visé : **Assistant Développeur Fullstack, équipe APIs de la BU Éditeur**.

Objectif : montrer que tu as construit **leur job en miniature**, et pouvoir défendre chaque choix.
Ne récite rien. Tu as écrit ce code, tu peux l'expliquer.

---

## 1. Les trois points à marteler

Tout le reste est du détail. Si l'entretien déraille, ramène-le à ces trois idées.

| | Le point | La preuve immédiate |
|---|---|---|
| **1** | **J'ai écrit le contrat avant le code.** | `git log --oneline` : le commit de la spec précède le premier handler |
| **2** | **Ma documentation ne peut pas mentir** — elle est vérifiée par les tests et générée depuis la même source. | 18 tests de contrat ; le portail `/docs` ne contient aucun texte écrit à la main |
| **3** | **J'ai livré l'API *et* ses outils** : portail + console. Une API seule n'est pas un produit. | Les trois onglets ouverts côte à côte |

Le point 3 est celui qui te distingue d'un candidat qui a « fait une API REST ».

---

## 2. Le pitch, 30 secondes

> « J'ai construit une API de distribution ferroviaire, avec les deux outils qui l'entourent : un
> portail de documentation et une console d'administration. J'ai commencé par écrire le contrat
> OpenAPI, avant la première ligne de code, et les tests valident chaque réponse contre ce contrat.
> Le portail est généré depuis la même spec — donc la documentation ne peut pas dériver. »

Trois idées, dans cet ordre : **le périmètre** (API + portail + console), **la méthode** (contrat
d'abord), **la garantie** (les tests interdisent la dérive).

---

## 3. La démo minutée — 5 minutes

Onglets à ouvrir **avant** d'entrer : `/`, `/docs`, `/admin`, et un terminal sur le repo.

| Temps | Ce que tu montres | Ce que tu dis |
|---|---|---|
| **0:00 – 0:30** | La page d'accueil, la chaîne de distribution | « Le maillon du milieu : transformer une offre en produit consommable par des tiers. » |
| **0:30 – 1:30** | `/docs`, colonne de gauche, 4 opérations | « **Rien de cette page n'est écrit à la main.** Tout vient de `openapi.yaml`. » |
| **1:30 – 2:30** | Bouton **Envoyer** sur `searchOffers` | Montre **trois** choses : la réponse en direct, les en-têtes `RateLimit-*`, la commande `curl` prête à copier. |
| **2:30 – 3:15** | Provoque une erreur : `date=04-08-2026` | « `problem+json`, un `type` stable, et le champ fautif nommé. Un intégrateur corrige en dix secondes au lieu d'ouvrir un ticket. » |
| **3:15 – 4:15** | `/admin` : émets une clé, puis révoque-la | « Le secret n'apparaît **qu'une fois** : on ne stocke que l'empreinte SHA-256. » Puis montre le `401` après révocation. |
| **4:15 – 4:45** | Le journal d'appels, en bas de la console | « Les appels qu'on vient de faire, avec leur statut. C'est ce qu'un admin regarde quand un canal se plaint. » |
| **4:45 – 5:00** | Le terminal : `git log --oneline` | « Le commit du contrat précède le premier handler. C'est la preuve, pas l'affirmation. » |

**Le moment le plus fort est 4:45.** Garde-le pour la fin, ne le noie pas au milieu.

Si tu as plus de temps : `/guide` (le guide technique, dont les chiffres et les titres de tests sont
lus dans le dépôt au moment du build) et `/presentation` (le deck).

### Plan B — si le réseau tombe

1. `npm run dev` en local : le projet démarre **sans aucune variable d'environnement**, en mode
   démonstration.
2. Si même ça échoue : `npm test` (moins d'une seconde) puis fais défiler `spec/openapi.yaml` et
   `docs/architecture/`. La méthode se raconte très bien sans serveur.

Teste le plan B **la veille**, pas devant eux.

---

## 4. Les questions pièges

### « Pourquoi pas de base de données ? » — *la question qui vient à coup sûr*

> C'est un choix explicite, documenté dans une ADR, pas un oubli. L'objet du projet est la chaîne
> API + portail + console : c'est là qu'était la difficulté intéressante. J'ai isolé le stockage
> derrière une interface de sept méthodes sans logique métier — `create`, `findById`, `findByPrefix`,
> `update`, `all`, `appendUsage`, `recentUsage`. Brancher Firestore ou Postgres, c'est une classe à
> écrire, **zéro ligne de domaine à toucher**. La limite est écrite dans le README et dans l'ADR : en
> production, il faut un adaptateur durable, parce que sur une plateforme sans état les clés ne
> survivent pas au redémarrage.

**Ne bafouille pas, et surtout ne t'excuse pas.** Une contrainte documentée est une décision ; une
contrainte cachée est une faute.

### « Comment tu passerais à l'échelle ? »

Commence par l'honnêteté, puis montre que tu sais **où** ça casserait.

> Je n'ai pas fait de test de charge, donc je ne vais pas inventer des chiffres. En revanche je vois
> bien où sont les goulots, et ils sont tous au même endroit : **l'état partagé**.

Puis déroule, du plus simple au plus subtil :

| Goulot | Pourquoi | Ce que je ferais |
|---|---|---|
| **Le catalogue** | Beaucoup de lecture, données identiques pour tout le monde | C'est le cas facile : cache CDN, clé de cache `(origine, destination, date)`, TTL court. Déjà en ISR aujourd'hui. |
| **Le compteur de quota** | **Une écriture à chaque appel** — le vrai point de contention | Compteur atomique dans Redis (`INCR`), pas une transaction relationnelle. Un compteur n'a pas besoin des garanties d'une base transactionnelle. |
| **La vérification de clé** | Une lecture à chaque appel | Cache par instance avec TTL court. Le compromis à assumer : la révocation met alors quelques secondes à se propager. Sur une clé compromise, c'est un vrai sujet — d'où un TTL court et une invalidation explicite à la révocation. |
| **Le journal d'appels** | Une écriture synchrone dans le chemin de la réponse | Le sortir du chemin critique : file de messages, ou log structuré agrégé en aval. Un journal ne doit jamais ralentir une réponse. |

> Le fil conducteur, c'est que le calcul est déjà sans état : les fonctions scalent horizontalement
> toutes seules. Tout le travail consiste à **sortir l'état du processus** et à choisir, pour chaque
> morceau d'état, le magasin adapté à sa nature — un compteur, un cache et un journal n'ont pas les
> mêmes besoins de cohérence.

Cette dernière phrase est celle qui fait la différence.

### « Et la sécurité des clés ? »

> Le secret n'existe en clair qu'à un seul instant : l'émission. Je stocke une empreinte SHA-256 et
> un préfixe non secret de 13 caractères pour l'affichage dans la console. À la vérification, je
> cherche les candidats **par préfixe**, puis je compare les empreintes **en temps constant** avec
> `timingSafeEqual`.

Si on te demande pourquoi le temps constant :

> Parce que `===` s'arrête au premier caractère différent. Le temps de réponse laisse donc fuir le
> nombre de caractères devinés, et un attaquant peut reconstruire le secret caractère par caractère.
> Le coût du temps constant est nul, l'omission serait une faute.

Si on te demande pourquoi chercher par préfixe plutôt que par empreinte :

> Parce que chercher directement par empreinte déléguerait la comparaison à l'index de la base de
> données, hors de mon contrôle. Le préfixe n'est pas un secret — il est affiché en clair dans la
> console — donc le filtrer d'abord ne révèle rien, et ça réduit la comparaison à temps constant à
> une poignée de candidats.

**Ce qui n'est pas fait, et qu'il faut dire** : pas de rotation automatique des clés, pas de
restriction par IP, pas de détection d'usage anormal.

### « Qu'est-ce que le Spec Driven Development, concrètement ? »

> Écrire le contrat avant le code, et s'en servir comme source unique de vérité. Concrètement, ça
> m'a forcé à répondre **avant** de coder à : comment on pagine, à quoi ressemble une erreur, quel
> champ est obligatoire, que se passe-t-il au dépassement de quota. Ces réponses coûtent une heure
> avant, et une migration après. Et surtout : la spec n'est pas un document mort, elle est chargée
> par les tests et par le portail.

### « Comment tu garantis que la doc reste à jour ? »

> Je ne la garantis pas humainement, je la rends **mécaniquement impossible à désynchroniser**. Les
> tests valident chaque réponse contre le schéma publié, avec `additionalProperties: false`. Si
> j'ajoute un champ sans le documenter, la suite tombe. Le portail lit le même fichier.

### « Zod et Ajv, pourquoi les deux ? » — *bonne question, ils la posent aux gens attentifs*

> Ils ne font pas le même travail, et ils ne regardent pas dans la même direction. **Zod valide ce
> qui entre** : les paramètres de requête, à l'exécution, pour renvoyer un `400` qui nomme le champ
> fautif. **Ajv valide ce qui sort**, dans les tests, contre les schémas JSON de la spec. L'un
> protège le métier des entrées, l'autre protège les clients de mes régressions.

### « Pourquoi RFC 9457 plutôt qu'un `{ "error": "..." }` maison ? »

> Parce que le client a besoin d'un identifiant **stable** sur lequel brancher son code. Avec un
> champ `type` documenté, je peux reformuler ou traduire les messages sans casser personne. Un
> format maison force chaque intégrateur à parser du texte d'erreur, qui casse à la première
> correction de faute de frappe.

### « Comment marchent tes quotas ? »

> Compteur par période civile : chaque clé porte le mois courant et un compteur. Le réarmement est un
> changement d'étiquette, pas une purge — un enregistrement dont la période est révolue compte pour
> zéro, donc aucune tâche planifiée à minuit le 1er. J'ai choisi ça parce qu'un quota commercial
> *est* une notion mensuelle. Si le besoin était de protéger l'infrastructure contre les pics, ce
> serait un token bucket — **c'est un autre problème**.

Savoir dire cette dernière phrase vaut plus que connaître les deux algorithmes.

### « Comment tu gères un changement cassant sur une API déjà consommée ? »

> D'abord en évitant d'en faire : ajouter un champ optionnel n'est pas cassant, en retirer un ou en
> changer le type l'est. Quand c'est inévitable, c'est une nouvelle version dans l'URL — d'où le
> `/v1` dès le premier jour — avec les deux versions servies en parallèle le temps que les canaux
> migrent, et une date de fin annoncée. Ce que je n'ai pas fait ici et qu'il faudrait en vrai : de
> la télémétrie par version et par clé, pour savoir **qui** utilise encore la `v1` avant de
> l'éteindre.

### « Comment tu testes une API sans lancer de serveur ? »

> Le domaine ne connaît pas HTTP : je lui passe un catalogue et des critères, il rend une page. Et
> pour les routes, j'appelle directement les handlers avec un objet `Request` standard. La suite
> complète tourne en moins d'une seconde, donc je la lance en permanence.

### « Pourquoi Next.js pour une API ? »

> Parce que le projet n'est pas qu'une API : le portail et la console sont deux vraies interfaces, et
> je voulais qu'ils vivent dans le même dépôt que la spec qu'ils affichent. Pour une API seule, un
> service Node ou Go plus léger serait plus adapté — Next.js apporte ici tout ce qui entoure l'API,
> pas l'API elle-même.

### « Tu as utilisé l'IA ? » — *sois franc, ils travaillent en Spec Driven Dev avec IA*

> Oui, comme outil de production. Ce qui rend ça sûr, c'est justement la méthode : le contrat est
> écrit et relu en premier, les tests valident contre lui, et je relis chaque décision. L'IA
> accélère l'écriture ; **c'est la spec et les tests qui garantissent le résultat.** C'est d'ailleurs
> pour ça que la méthode m'intéresse : elle passe à l'échelle avec l'outillage.

---

## 5. Les limites, à dire *avant* qu'on te les demande

Annoncer ses limites en premier retire à l'autre le plaisir de les trouver, et te fait gagner en
crédibilité. Place-les naturellement, vers la fin de la démo.

- **Le stockage des clés est en mémoire.** Elles ne survivent pas à un redémarrage. Choix documenté.
- **Les données sont fictives**, générées de façon déterministe sur 21 jours glissants.
- **L'API est en lecture seule.** Pas de réservation, donc pas d'idempotence, pas de transactions
  distribuées, pas de gestion d'inventaire. Ce sont les vraies questions difficiles, et je ne
  prétends pas les avoir traitées.
- **Une seule version.** La stratégie de versionnage est prévue dans les URL, jamais éprouvée par un
  vrai changement cassant.
- **La console d'admin est volontairement simple** : un mot de passe, un jeton signé. Ni OAuth, ni
  comptes multiples, ni rôles.
- **Aucun test de charge.** Je sais où sont les goulots probables, je n'ai pas de chiffres.

---

## 6. Les chiffres à avoir en tête

| | |
|---|---|
| Opérations documentées | 4, toutes en lecture |
| Tests | **54**, dont **18** de contrat |
| Durée de la suite | moins d'une seconde |
| Décisions d'architecture écrites | 6 ADR, chacune avec son coût |
| Lignes de contrat OpenAPI | 432 |
| Méthodes de l'interface `KeyStore` | 7, aucune logique métier |

---

## 7. Trois questions à leur poser

Elles montrent que tu as compris leur métier, pas seulement le tien.

1. « Quels sont aujourd'hui les principaux consommateurs de vos APIs — équipes internes, ou canaux
   externes ? Ça change beaucoup la façon de penser la doc et le versionnage. »
2. « Comment gérez-vous les changements cassants sur une API déjà consommée par des tiers ? »
3. « Le portail de doc que vous construisez est-il généré depuis vos specs, ou rédigé à part ? »

---

## 8. Ce qu'il ne faut pas faire

- **Ne pas survendre.** C'est une démonstration : transporteurs fictifs, stockage en mémoire. Dire
  les limites *avant* qu'on te les demande te fait gagner en crédibilité.
- **Ne pas réciter le vocabulaire.** Si tu dis « architecture hexagonale », on te demandera de
  définir un port et un adaptateur. Réponds par les noms réels : le port c'est `KeyStore`,
  l'adaptateur c'est `InMemoryKeyStore`.
- **Ne pas prétendre connaître leur métier.** Tu as compris la chaîne de distribution ; le reste,
  demande-le.
- **Ne pas dire « je ne sais pas » tout court.** Dis plutôt ce que tu ferais pour le savoir : « je
  n'ai pas mesuré, mais je regarderais d'abord X ». C'est la réponse d'un ingénieur.
