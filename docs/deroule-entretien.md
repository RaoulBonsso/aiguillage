# Déroulé complet de l'entretien — Tesmo, 4 août

Poste : **Assistant Développeur Fullstack**, équipe APIs de la **BU Éditeur**, distribution ferroviaire.

Ce document se lit de haut en bas. Tout ce qui est en `>` se dit à voix haute — approprie-le, ne le
récite pas. Ce qui est en gras dans tes phrases, c'est ce qu'il faut appuyer.

---

## 0. Dix minutes avant

**À ouvrir, dans cet ordre, et à laisser ouvert :**

| Onglet | URL |
|---|---|
| 1 | https://aiguillage-delta.vercel.app |
| 2 | https://aiguillage-delta.vercel.app/docs |
| 3 | https://aiguillage-delta.vercel.app/admin *(déjà connecté)* |
| 4 | https://github.com/RaoulBonsso/aiguillage |
| 5 | Un terminal, positionné dans `~/Projects/aiguillage` |

**Connecte-toi à la console maintenant**, pas devant eux : mot de passe `aiguillage`.

**Vérifie une fois** que le bouton « Envoyer » du portail répond. Si le réseau du lieu est mauvais,
tu le sauras avant, pas pendant.

**Plan B, si le réseau tombe :** `npm run dev` — le projet démarre sans aucune variable
d'environnement. Plan C : `npm test` (moins d'une seconde) puis tu fais défiler `spec/openapi.yaml`.
La méthode se raconte très bien sans serveur.

**Respire.** Tu n'as pas à prouver que tu es senior. Tu as à prouver que tu comprends **ce qu'ils
font** et que tu travailles proprement. C'est tout ce qu'on demande à un alternant.

---

## 1. La présentation de toi — 2 minutes

Quand on te dit « présentez-vous ». Cinq temps, deux minutes, pas plus.

### 0:00 — Qui

> « Bonjour, je m'appelle Raoul. Je suis en M1 en développement, et je cherche une alternance où je
> peux vraiment monter en compétence sur du **back-end** et du **fullstack** modernes — en équipe, et
> sur des sujets qui vont en production. »

*Ton posé. Tu poses le cadre en quinze secondes, tu ne récites pas ton CV.*

### 0:20 — Ce que je sais faire

> « Techniquement, je suis à l'aise avec **TypeScript** et **Git**, je travaille en **TDD** — j'écris
> les tests avant le code — et je comprends comment fonctionne une **API REST** : les verbes, les
> codes de statut, le fait qu'une requête soit indépendante de la précédente. J'ai aussi de
> l'expérience sur **Next.js** côté front, et j'ai touché à **NestJS** sur un projet d'école. »

*Ne gonfle rien. Si tu dis Kotlin et qu'ils creusent, tu tombes. Dis ce que tu sais, et dis-le net.*

### 0:50 — Pourquoi eux

C'est ici que tu montres que tu as lu l'offre **et** compris le métier. Cette phrase vaut le reste
de l'entretien :

> « Ce qui m'attire dans votre offre, c'est l'idée de traiter les **APIs comme un produit à part
> entière**. Si je comprends bien, la **BU Éditeur** construit l'offre commerciale à partir des
> données brutes, et votre équipe l'expose aux **canaux de distribution** — les sites, les applis,
> les agences. Et les deux livrables mentionnés, le **portail de documentation** et la **console
> d'administration**, ce sont précisément les deux choses qui rendent une API consommable et
> pilotable. »

*Pause. Laisse ça atterrir.*

### 1:20 — L'accroche vers le projet

> « D'ailleurs, en préparant cet entretien, j'ai voulu comprendre concrètement ce que ça implique de
> construire ça. J'ai donc réalisé un petit projet sur ce modèle : une API de distribution
> ferroviaire, avec son portail de doc et sa console d'admin. Ça m'a surtout appris ce qui est
> difficile là-dedans — et ce n'est pas ce que je croyais. »

### 1:45 — Ce que je cherche

> « Ce que je veux, c'est apprendre auprès de gens plus expérimentés que moi, sur du code qui sert
> vraiment à quelqu'un. Je n'ai pas besoin qu'on me donne des sujets faciles. »

**Puis tu te tais.** Ne meuble pas. Le silence après une bonne dernière phrase travaille pour toi.

---

## 2. Proposer la démo — sans forcer

Tu as posé l'hameçon en 1:20. Neuf fois sur dix, ils demandent d'eux-mêmes. Sinon, tu proposes au
premier moment naturel — après une question technique, ou quand ils demandent « vous avez des
projets ? » :

> « Est-ce que ça vous intéresse que je vous le montre ? C'est en ligne, ça prend cinq minutes, et
> ça répondra sûrement à plusieurs de vos questions d'un coup. »

**Trois règles absolues :**

1. **Demande la permission**, ne l'impose pas. « Est-ce que ça vous intéresse » — pas « je vais vous
   montrer ».
2. **Annonce la durée.** « Cinq minutes » rassure. Personne n'ouvre une démo sans savoir quand elle
   finit.
3. **S'ils disent non ou plus tard**, ne insiste pas d'un millimètre. Tu réponds à leurs questions,
   et tu reproposes à la fin : « si vous avez deux minutes, je peux vous montrer très vite. »

---

## 3. La démo — 5 minutes chrono

### 0:00 → 0:30 · La page d'accueil · *poser le métier*

Onglet 1.

> « Aiguillage, c'est une API de distribution ferroviaire. Le principe métier : entre les données
> brutes d'un transporteur et le voyageur qui achète son billet, il y a une chaîne d'acteurs qui ne
> se connaissent pas. Ce projet occupe **le maillon du milieu** : transformer une offre en produit
> consommable par des **canaux de vente tiers**. »

Montre la frise sur la page : *Données brutes → Édition de l'offre → **Aiguillage** → Canaux de vente
→ Voyageur.*

> « Les transporteurs et les tarifs sont fictifs — c'est une démonstration technique, pas une reprise
> de l'offre de qui que ce soit. »

*Dire ça tout de suite te crédibilise. Ça montre que tu sais où est la limite.*

### 0:30 → 1:30 · Le portail · *l'idée centrale*

Onglet 2. Fais défiler la colonne de gauche : quatre opérations groupées par thème.

> « Voici le portail de documentation. Quatre opérations : le référentiel des gares, la recherche
> d'offres, le détail d'une offre, et l'état de la clé appelante. »

Puis **la phrase qui compte** :

> « Et le point important : **rien de cette page n'est écrit à la main**. Les titres, les
> descriptions, les paramètres, les schémas, les exemples — tout est lu dans le fichier
> `openapi.yaml`. Si j'ajoute une opération au contrat, elle apparaît ici toute seule, avec sa
> console d'essai. »

### 1:30 → 2:30 · L'appel en direct · *montrer trois choses*

Clique **Envoyer** sur `searchOffers`. Pointe explicitement les trois :

> « Là, ça appelle vraiment l'API. Trois choses à regarder :
> **un**, la réponse réelle, avec le temps en millisecondes ;
> **deux**, les en-têtes `RateLimit-Limit`, `Remaining` et `Reset` — je les pose sur **toutes** les
> réponses, pas seulement sur les refus, pour qu'un intégrateur puisse ralentir *avant* de se faire
> jeter ;
> **trois**, la commande `curl` équivalente, prête à copier. »

Si tu veux un détail métier qui fait mouche :

> « Vous remarquerez qu'un train complet reste dans les résultats, marqué `sold_out`. C'est
> volontaire : c'est au canal de vente de décider s'il le grise. Si l'API le faisait disparaître, le
> voyageur croirait que le train n'existe pas. »

### 2:30 → 3:15 · L'erreur · *le sens du client*

Remplace la date par `04-08-2026` (format inversé). Envoie.

> « Erreur volontaire. On récupère un **`400`** au format **`application/problem+json`** — la RFC
> 9457. Il y a un `type` qui est un identifiant **stable et documenté** : c'est là-dessus qu'un
> client branche son code, pas sur le message, que je peux reformuler ou traduire sans casser
> personne. Et surtout : **le champ fautif est nommé**, avec le format attendu. C'est la différence
> entre un intégrateur qui corrige son appel en dix secondes et un intégrateur qui ouvre un ticket. »

### 3:15 → 4:15 · La console · *le second livrable*

Onglet 3.

> « Le deuxième livrable : la console d'administration. C'est ce qui remplace des scripts éparpillés
> par un point de contrôle unique. »

Émets une clé — nom « Démo entretien », quota 10.

> « J'émets une clé pour un canal de vente. Le secret n'apparaît **qu'une seule fois**, ici. Ensuite
> il est perdu, parce que je n'en stocke que **l'empreinte SHA-256** et un préfixe non secret de
> treize caractères pour que l'admin reconnaisse ses clés. »

Puis clique **Révoquer** sur une clé.

> « Et la révocation prend effet à l'appel suivant : il reçoit un `401`. »

Descends sur le journal :

> « En bas, le journal des appels, avec les statuts — y compris les `404` et les `429`. C'est ce
> qu'un administrateur regarde quand un canal de vente se plaint. »

### 4:15 → 5:00 · La preuve · *le clou*

Onglet 4 ou terminal. `git log --oneline`.

> « Dernier point, et c'est celui auquel je tiens le plus. Tout le monde dit travailler en **Spec
> Driven Development**. Ici, l'ordre des commits le prouve : le commit du **contrat OpenAPI** arrive
> **trois commits avant** le premier handler HTTP. J'ai écrit le contrat, puis j'ai écrit le code
> pour le satisfaire. »

**Ne noie pas ce moment.** C'est ta meilleure carte, elle passe en dernier.

---

## 4. Le bonus — si tu sens que ça accroche

Trente secondes de plus, et c'est ce qui te distingue de tous les autres candidats. Dans le terminal :

> « Je peux vous montrer ce qui se passe si je triche ? »

Ajoute un champ non documenté dans une réponse, puis `npm test` :

```
FAIL  src/app/api/v1/routes.test.ts > sert le référentiel et respecte le schéma de réponse
AssertionError: expected [ '/meta must NOT have additional properties' ] to deeply equal []
```

> « Mes tests ne valident pas les réponses contre **mes attentes** : ils les valident contre **les
> schémas publiés dans la spec**, avec Ajv. `additionalProperties: false` fait que je ne peux pas
> ajouter un champ sans le documenter, et les champs requis font que je ne peux pas en retirer un.
> Ma documentation ne **peut pas** dériver — ce n'est pas une question de discipline, c'est une
> question de tests qui tombent. »

*Puis tu retires le champ et tu montres les 54 tests au vert.*

---

## 5. Leur vocabulaire — à placer juste

N'en récite jamais une liste. Place-les **quand ils tombent naturellement**, et sois prêt à définir
chacun si on te coupe pour te tester.

| Terme | Ce que ça veut dire, si on te le demande |
|---|---|
| **Distribution** | Le transport de l'information commerciale du transporteur jusqu'aux canaux de vente |
| **BU Éditeur** | L'unité qui *édite* l'offre : transforme des données brutes en produits vendables |
| **Canal de vente** | Tout ce qui vend le trajet au voyageur : site, appli, agence, revendeur tiers |
| **API-as-a-Product** | L'API est le produit, pas un sous-produit : elle a des clients, une doc, un support, un cycle de vie |
| **Developer portal** | Le site où un intégrateur découvre l'API, lit la spec, teste, récupère ses clés |
| **Spec Driven Development** | Écrire le contrat avant le code, et s'en servir comme source unique de vérité |
| **OpenAPI** | Le format standard de description d'une API REST — ici en 3.1 |
| **Contract testing** | Vérifier automatiquement que l'implémentation respecte le contrat publié |
| **RFC 9457** | Le format standard des erreurs HTTP : `type`, `title`, `status`, `detail` |
| **Idempotence** | Rejouer la même requête donne le même résultat — vrai pour tous mes `GET` |
| **Breaking change** | Un changement qui casse un client existant : retirer un champ, changer un type |
| **Rate limiting / quota** | Limiter le nombre d'appels — chez moi un quota commercial mensuel par clé |
| **Port / adaptateur** | Le port est l'interface (`KeyStore`), l'adaptateur l'implémentation (`InMemoryKeyStore`) |
| **TDD** | Test d'abord (RED), code minimal (GREEN), puis nettoyage — visible dans mes commits |

**Piège classique :** ne dis jamais « architecture hexagonale » si tu n'es pas prêt à définir port et
adaptateur dans la seconde. Tu l'es maintenant — mais dis-le **avec** l'exemple, pas tout seul.

---

## 6. Les questions qu'ils vont poser

### « Pourquoi pas de base de données ? » — *elle viendra*

> « C'est un choix explicite, documenté dans une ADR, pas un oubli. L'objet du projet était la chaîne
> API + portail + console : c'est là qu'était la difficulté intéressante. J'ai isolé le stockage
> derrière une interface de **sept méthodes sans aucune logique métier** — `create`, `findById`,
> `findByPrefix`, `update`, `all`, `appendUsage`, `recentUsage`. Brancher Firestore ou Postgres,
> c'est une classe à écrire, **zéro ligne de domaine à toucher**. La limite est écrite dans le
> README : en production, sur une plateforme sans état, les clés ne survivent pas au redémarrage. Il
> faut un adaptateur durable. »

**Ne t'excuse pas.** Une contrainte documentée est une décision ; une contrainte cachée est une faute.

### « Comment vous passeriez à l'échelle ? »

Commence par l'honnêteté :

> « Je n'ai pas fait de test de charge, donc je ne vais pas inventer des chiffres. En revanche je
> vois où ça casserait, et c'est toujours au même endroit : **l'état partagé**. »

| Goulot | Ce que tu dis |
|---|---|
| Le catalogue | Beaucoup de lecture, mêmes données pour tous → cache CDN, clé `(origine, destination, date)`, TTL court |
| Le compteur de quota | **Une écriture par appel**, le vrai point de contention → compteur atomique Redis (`INCR`), pas une transaction relationnelle |
| La vérification de clé | Une lecture par appel → cache par instance à TTL court, mais **le compromis à assumer** : la révocation met alors quelques secondes à se propager |
| Le journal | Écriture synchrone dans le chemin de la réponse → à sortir du chemin critique, file de messages ou log agrégé |

Puis la phrase qui fait la différence :

> « Le fil conducteur, c'est que le calcul est déjà **sans état** : ça scale horizontalement tout
> seul. Tout le travail consiste à **sortir l'état du processus**, et à choisir pour chaque morceau
> d'état le magasin adapté à sa nature — un compteur, un cache et un journal n'ont pas les mêmes
> besoins de cohérence. »

### « Et la sécurité des clés ? »

> « Le secret n'existe en clair qu'à un seul instant : l'émission. Ensuite je ne manipule qu'une
> **empreinte SHA-256**. À la vérification, je cherche les candidats **par préfixe**, puis je compare
> les empreintes **en temps constant**. »

Si on demande pourquoi le temps constant :

> « Parce que `===` s'arrête au premier caractère différent. Le temps de réponse laisse donc fuir le
> nombre de caractères devinés, et un attaquant peut reconstruire le secret caractère par caractère.
> Le coût du temps constant est nul, l'omission serait une faute. »

Si on demande pourquoi par préfixe plutôt que par empreinte :

> « Parce que chercher directement par empreinte déléguerait la comparaison à l'index de la base,
> hors de mon contrôle. Le préfixe n'est pas secret — il est affiché dans la console — donc le
> filtrer d'abord ne révèle rien, et ça réduit la comparaison à temps constant à quelques candidats. »

**Ce qui n'est pas fait, et qu'il faut dire :** pas de rotation automatique des clés, pas de
restriction par IP, pas de détection d'usage anormal.

### « Comment vous gérez un changement cassant sur une API consommée par des tiers ? »

*C'est LA question de leur métier. Sois honnête, puis montre que tu sais raisonner.*

> « Sur mon projet, je ne l'ai pas traité : j'ai un préfixe `/v1` et c'est tout. C'est d'ailleurs le
> premier sujet que j'ouvrirais sur une vraie API. Ce que j'en comprends, c'est qu'il faut distinguer
> ce qui casse et ce qui ne casse pas : **ajouter** un champ optionnel ne casse personne, **retirer**
> un champ ou changer un type casse tout le monde. Donc on ajoute sans versionner, et on ne retire
> qu'avec une nouvelle version, une période de cohabitation, et une communication aux consommateurs.
> Et pour savoir qui serait cassé, il faut déjà savoir **qui consomme quoi** — ce que mon journal
> d'appels par clé commence à donner. C'est un sujet que j'aimerais beaucoup apprendre chez vous. »

### « Vous avez utilisé l'IA ? » — *sois franc, ils travaillent avec*

> « Oui, comme outil de production. Ce qui rend ça sûr, c'est justement la méthode : le contrat est
> écrit et relu en premier, les tests valident contre lui, et je relis chaque décision — je suis
> capable d'expliquer pourquoi chaque ligne est là. L'IA accélère l'écriture ; ce sont la spec et les
> tests qui garantissent le résultat. C'est exactement pour ça que le Spec Driven Development prend
> de la valeur avec l'IA : plus on génère vite, plus il faut quelque chose de non négociable en face. »

### « Qu'est-ce que le TDD, concrètement, pour vous ? »

> « J'écris le test d'abord, je le regarde échouer — sinon je ne sais pas s'il teste quelque chose —
> puis j'écris le code minimal pour le faire passer. Mes commits sont d'ailleurs marqués RED et
> GREEN. Et ça m'a servi concrètement : en écrivant un test sur les dates, j'ai découvert que
> `Date.parse` accepte le **31 février** et le reporte silencieusement au 3 mars. Mon contrôle de
> validité ne servait à rien depuis le début. Sans ce test, l'API aurait répondu sur une date que le
> client n'avait pas demandée. »

*Cette anecdote est ta meilleure. Elle prouve que tes tests travaillent vraiment.*

### « Qu'est-ce qui a été le plus difficile ? »

> « Résister à la tentation de coder avant d'avoir fini le contrat. Écrire la spec d'abord oblige à
> répondre tout de suite à des questions qu'on repousse d'habitude : comment on pagine, à quoi
> ressemble une erreur, quel champ est obligatoire, que se passe-t-il au dépassement de quota. C'est
> inconfortable, parce qu'on a l'impression de ne pas avancer. Mais ces réponses coûtent une heure
> avant le code — et une migration après. »

---

## 7. Les limites — à dire avant qu'on te les demande

Place-les à la fin de la démo, spontanément. C'est ce qui rend tout le reste crédible.

> « Je préfère vous dire d'emblée ce que ce projet **n'est pas** :
> **un**, il n'y a pas de base de données — le stockage des clés est en mémoire, c'est documenté dans
> une ADR, et en production il faudrait un adaptateur durable ;
> **deux**, l'API est en lecture seule : pas de réservation, pas de paiement — ce qui m'évite au
> passage les vrais sujets difficiles, l'idempotence des paiements et la gestion des stocks ;
> **trois**, pas de stratégie de versionnage, j'en parlais tout à l'heure ;
> **quatre**, aucun test de charge.
> Ce que je revendique, c'est la chaîne complète API + portail + console, la méthode, et le fait que
> chaque décision est écrite avec son coût. »

**Pourquoi ça marche :** un candidat qui liste ses propres limites est un candidat qui sait relire
son travail. C'est exactement ce qu'on cherche chez un alternant — pas quelqu'un qui sait tout, mais
quelqu'un à qui on peut faire confiance sur ce qu'il déclare.

---

## 8. Tes questions à eux — 3, pas plus

Pose-les à la fin. Choisis-en trois selon ce qui s'est dit.

**Les meilleures, dans l'ordre :**

1. > « Quels sont aujourd'hui les principaux consommateurs de vos APIs — des équipes internes, ou des
   > canaux externes ? J'imagine que ça change beaucoup la façon de penser la documentation et le
   > versionnage. »

2. > « Comment gérez-vous les changements cassants sur une API déjà consommée par des tiers ? C'est
   > le sujet sur lequel je me sens le plus incomplet. »

3. > « Le portail de documentation que vous construisez, il est généré depuis vos specs, ou rédigé à
   > part ? »

**Deux autres, si le courant passe :**

4. > « Concrètement, à quoi ressemblerait ma première semaine, et sur quoi j'aurais le droit de me
   > tromper ? »

5. > « Vous mentionnez le Spec Driven Development et l'IA dans l'offre — comment ça se traduit dans
   > votre quotidien ? »

**Ce qu'il ne faut pas demander en premier entretien :** le salaire, les jours de télétravail, les
horaires. Ça vient après, ou c'est eux qui l'abordent.

---

## 9. La conclusion — 30 secondes

Quand on te demande si tu veux ajouter quelque chose :

> « Juste une chose. Ce projet, je l'ai fait parce que je voulais comprendre **de l'intérieur** ce
> que votre équipe fait au quotidien — pas pour cocher une case. Ce que j'en retire, c'est qu'une API
> destinée à des tiers, c'est autant un travail de **contrat et de rigueur** qu'un travail de code.
> C'est exactement ce que j'ai envie d'apprendre, et j'aimerais beaucoup l'apprendre chez vous. »

Puis :

> « Merci du temps que vous m'avez accordé. Est-ce que je peux vous demander quelles sont les
> prochaines étapes ? »

**Toujours demander les prochaines étapes.** Ça montre que tu es sérieux, et ça t'évite une semaine
d'attente sans savoir.

---

## 10. Les pièges — ce qui peut te faire perdre

| Piège | Ce que tu fais à la place |
|---|---|
| Survendre le projet | Dis « démonstration », « fictif », « limites documentées » |
| Utiliser un mot que tu ne peux pas définir | Ne le dis pas. Un terme mal placé décrédibilise dix bonnes phrases |
| Parler trop vite pendant la démo | Une idée, une pause. Ils doivent avoir le temps de regarder l'écran |
| Rester bloqué sur une question | « Je ne sais pas. Ce que je ferais, c'est… » — c'est une **bonne** réponse |
| Prétendre connaître leur métier | Tu comprends la chaîne. Le reste, tu le demandes |
| Récupérer la main quand ils parlent | Laisse-les finir. Note. Rebondis après |
| Oublier de conclure | Trente secondes de fin nette valent cinq minutes de milieu |

**Si on te pose une question dont tu ignores la réponse :**

> « Honnêtement, je ne sais pas. Ce que je ferais, c'est [ton raisonnement]. Est-ce que c'est comme
> ça que vous le voyez ? »

C'est la meilleure réponse possible en alternance. On n'embauche pas un alternant pour ce qu'il sait,
mais pour la façon dont il réagit devant ce qu'il ne sait pas.

---

## 11. Ta fiche mémo — une page à relire dans les cinq dernières minutes

**Les trois phrases :**
1. J'ai construit une API **et les deux outils qui la rendent utilisable** — portail + console.
2. J'ai écrit **le contrat avant le code**, et `git log` le prouve.
3. Les tests valident chaque réponse **contre ce contrat** — ma doc ne peut pas mentir.

**Les chiffres :** 4 opérations · 54 tests dont 18 de contrat · suite en moins d'1 seconde · 6 ADR.

**La démo :** accueil (0:30) → portail (1:00) → appel réel (1:00) → erreur 400 (0:45) → console
(1:00) → `git log` (0:45).

**L'anecdote :** `Date.parse` accepte le 31 février. Mon test l'a trouvé.

**Les limites :** pas de base · lecture seule · pas de versionnage · pas de test de charge.

**Les trois questions :** consommateurs internes ou externes ? · gestion des breaking changes ? ·
portail généré ou rédigé ?

**Et si tout part de travers :** reviens toujours aux trois phrases. Elles suffisent.
