# Fiche de démo — entretien du 4 août

Objectif : montrer en trois minutes que tu as construit **leur job en miniature**, et pouvoir
défendre chaque choix. Ne récite rien : tu as écrit ce code, tu peux l'expliquer.

---

## 1. Le pitch, 30 secondes

> « J'ai construit une API de distribution ferroviaire, avec les deux outils qui l'entourent : un
> portail de documentation et une console d'administration. J'ai commencé par écrire le contrat
> OpenAPI, avant la première ligne de code, et les tests valident chaque réponse contre ce contrat.
> Le portail est généré depuis la même spec — donc la documentation ne peut pas dériver. »

Trois idées, dans cet ordre : **le périmètre** (API + portail + console), **la méthode** (spec
d'abord), **la garantie** (les tests interdisent la dérive).

---

## 2. Le parcours de démo, dans l'ordre

**a. La page d'accueil** — la chaîne de distribution. Dis : « le maillon du milieu, c'est
transformer une offre en produit consommable par des canaux tiers. »

**b. Le portail `/docs`** — fais défiler la colonne de gauche : quatre opérations, groupées par
thème. Précise : *« rien de cette page n'est écrit à la main, tout vient du fichier openapi.yaml. »*

**c. Clique sur « Envoyer » dans `searchOffers`.** Montre trois choses à l'écran :
- la réponse réelle, en direct ;
- les en-têtes `RateLimit-Limit / Remaining / Reset` ;
- la commande `curl` équivalente, prête à copier.

**d. Provoque une erreur.** Mets `date=04-08-2026` (le mauvais format). Montre le `400` :
`application/problem+json`, un `type` stable, et le champ fautif nommé.
Dis : *« un intégrateur corrige son appel en dix secondes au lieu d'ouvrir un ticket. »*

**e. La console `/admin`.** Émets une clé : le secret n'apparaît **qu'une fois**. Explique :
*« on ne stocke que l'empreinte SHA-256, le secret n'est lisible qu'à cet instant. »*
Puis révoque une clé et montre que l'appel suivant renvoie `401`.

**f. Le journal d'appels** en bas de la console — les appels que tu viens de faire, avec leur
statut. *« C'est ce qu'un admin regarde quand un canal se plaint. »*

**g. Le repo.** `git log --oneline` : le commit du contrat OpenAPI **précède** le premier handler.
C'est la preuve du Spec Driven Development, pas une affirmation.

---

## 3. Les questions qui vont tomber

**« Qu'est-ce que le Spec Driven Development, concrètement ? »**
> Écrire le contrat avant le code, et s'en servir comme source unique de vérité. Concrètement, ça
> m'a forcé à répondre avant de coder à : comment on pagine, à quoi ressemble une erreur, quel champ
> est obligatoire, que se passe-t-il au dépassement de quota. Ces réponses coûtent une heure avant,
> et une migration après. Et surtout : la spec n'est pas un document mort, elle est chargée par les
> tests et par le portail.

**« Comment tu garantis que la doc reste à jour ? »**
> Je ne la garantis pas humainement, je la rends mécaniquement impossible à désynchroniser. Les
> tests valident chaque réponse contre le schéma publié, avec `additionalProperties: false`. Si
> j'ajoute un champ sans le documenter, la suite tombe. Le portail lit le même fichier.

**« Pourquoi RFC 9457 plutôt qu'un `{ "error": "..." }` maison ? »**
> Parce que le client a besoin d'un identifiant **stable** sur lequel brancher son code. Avec un
> champ `type` documenté, je peux reformuler ou traduire les messages sans casser personne. Un
> format maison force chaque intégrateur à parser du texte.

**« Comment marchent tes quotas ? »**
> Compteur par période civile : chaque clé porte le mois courant et un compteur. Le réarmement est
> un changement d'étiquette, pas une purge. J'ai choisi ça parce qu'un quota commercial *est* une
> notion mensuelle. Si le besoin était de protéger l'infrastructure contre les pics, ce serait un
> token bucket — c'est un autre problème.

**« Et la sécurité des clés ? »**
> Le secret n'existe en clair qu'à l'émission. Je stocke une empreinte SHA-256 et un préfixe non
> secret pour l'affichage. À la vérification, je cherche par préfixe puis je compare les empreintes
> en temps constant — comparer avec `===` laisserait fuir, par le temps de réponse, le nombre de
> caractères devinés.

**« Pourquoi du stockage en mémoire ? »** *(la question piège — assume, ne bafouille pas)*
> C'est un choix explicite, documenté dans une ADR. L'objet du projet est la chaîne API + portail +
> console, pas le choix d'une base. J'ai isolé le stockage derrière une interface de sept méthodes,
> sans logique métier : brancher Firestore ou Postgres, c'est une classe à écrire, zéro ligne de
> domaine à toucher. La limite est écrite dans le README — en production, il faut un adaptateur
> durable.

**« Comment tu testes une API sans lancer de serveur ? »**
> Le domaine ne connaît pas HTTP : je lui passe un catalogue et des critères, il rend une page. Et
> pour les routes, j'appelle directement les handlers avec un objet `Request` standard. La suite
> complète tourne en moins d'une seconde, donc je la lance en permanence.

**« Tu as utilisé l'IA ? »** *(sois franc — ils travaillent en Spec Driven Dev avec IA)*
> Oui, comme outil de production. Ce qui rend ça sûr, c'est justement la méthode : le contrat est
> écrit et relu en premier, les tests valident contre lui, et je relis chaque décision. L'IA
> accélère l'écriture ; c'est la spec et les tests qui garantissent le résultat.

---

## 4. Trois questions à leur poser

1. « Quels sont aujourd'hui les principaux consommateurs de vos APIs — équipes internes, ou canaux
   externes ? Ça change beaucoup la façon de penser la doc et le versionnage. »
2. « Comment gérez-vous les changements cassants sur une API déjà consommée par des tiers ? »
3. « Le portail de doc que vous construisez est-il généré depuis vos specs, ou rédigé à part ? »

---

## 5. Les chiffres à avoir en tête

| | |
|---|---|
| Opérations documentées | 4 |
| Tests | 53, dont 17 tests de contrat |
| Durée de la suite | < 1 seconde |
| Décisions d'architecture écrites | 6 ADR, chacune avec son coût |

---

## 6. Ce qu'il ne faut pas faire

- **Ne pas survendre.** C'est une démonstration, les transporteurs sont fictifs, le stockage est en
  mémoire. Dire les limites *avant* qu'on te les demande te fait gagner en crédibilité.
- **Ne pas réciter le vocabulaire.** Si tu dis « architecture hexagonale », on te demandera de
  définir un port et un adaptateur. Tu peux : le port c'est `KeyStore`, l'adaptateur c'est
  `InMemoryKeyStore`.
- **Ne pas prétendre connaître leur métier.** Tu as compris la chaîne de distribution ; le reste,
  demande-le.
