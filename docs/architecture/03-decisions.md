# Décisions d'architecture

Chaque décision note aussi ce qu'elle **coûte**. Une décision sans inconvénient est une décision
qu'on n'a pas vraiment prise.

---

## ADR-1 — Écrire le contrat OpenAPI avant le code

**Décision.** `spec/openapi.yaml` a été écrit et commité *avant* la première ligne
d'implémentation. Le code est ensuite venu satisfaire le contrat.

**Pourquoi.** Sur une API destinée à des tiers, le contrat est le produit. L'écrire d'abord force à
répondre tout de suite aux questions qu'on repousse habituellement : comment on pagine, à quoi
ressemble une erreur, quel champ est obligatoire, que se passe-t-il quand le quota est atteint. Ces
réponses coûtent une heure avant le code, et une migration après.

**Coût.** Modifier une réponse demande de modifier deux fichiers, dans l'ordre : la spec, puis
l'implémentation. C'est volontairement un peu contraignant.

**Vérification.** L'historique git le prouve : le commit du contrat précède celui du premier
handler.

---

## ADR-2 — Valider les réponses contre la spec dans les tests

**Décision.** Un module (`src/lib/contract.ts`) charge la spec et compile ses schémas avec Ajv. Les
tests d'API valident chaque corps de réponse contre le schéma publié pour ce couple
(chemin, méthode, statut).

**Pourquoi.** Une documentation d'API dérive toujours dans le même sens : le code avance, la doc
reste. Le seul remède fiable est de rendre la dérive **impossible à commiter**. Ajouter un champ non
documenté fait tomber la suite (`additionalProperties: false`) ; en retirer un aussi.

**Coût.** Les schémas doivent rester assez précis pour être utiles, sans devenir si rigides que
toute évolution casse trente tests. Le curseur est mis sur les champs, pas sur les valeurs.

---

## ADR-3 — Le stockage des clés derrière un port, en mémoire par défaut

**Décision.** `KeyStore` est une interface (`src/domain/ports.ts`). L'implémentation livrée est
en mémoire (`src/data/key-store-memory.ts`).

**Pourquoi.** L'objet de ce projet est la chaîne API + portail + console, pas le choix d'une base.
Un stockage en mémoire rend la démonstration et les tests autonomes : rien à provisionner, aucune
clé d'accès à distribuer, une suite de tests qui tourne en moins d'une seconde.

**Coût — assumé et important.** En production sur une plateforme sans état, les clés émises depuis
la console ne survivent pas au redémarrage de l'instance. **Une instance réelle doit brancher un
adaptateur durable.** L'interface a été dessinée pour ça : `create`, `findById`, `findByPrefix`,
`update`, `all`, `appendUsage`, `recentUsage` — sept méthodes, aucune logique métier. Un adaptateur
Firestore ou Postgres est une classe d'une centaine de lignes, sans toucher au domaine.

**Ce qu'on ne fait pas.** Prétendre que c'est persistant. La limite est écrite dans le README et
sur la console.

---

## ADR-4 — Erreurs au format RFC 9457 (`application/problem+json`)

**Décision.** Toutes les erreurs portent `type`, `title`, `status`, souvent `detail`, et pour les
erreurs de validation un tableau `errors` champ par champ.

**Pourquoi.** `type` est un identifiant stable et documenté : c'est dessus qu'un client branche sa
logique. Les textes restent librement modifiables (traduction, précision) sans casser personne. Le
détail champ par champ est ce qui fait la différence entre un intégrateur qui corrige son appel en
dix secondes et un intégrateur qui ouvre un ticket.

**Coût.** Un format de plus à respecter partout — d'où sa centralisation dans `src/lib/problem.ts`.

---

## ADR-5 — Compter le quota par période civile, pas par fenêtre glissante

**Décision.** Chaque clé porte `{ période: "AAAA-MM", compteur }`. Le réarmement est un changement
d'étiquette de période.

**Pourquoi.** Un quota commercial mensuel *est* une notion civile : le client comprend « 10 000
appels par mois », pas « 10 000 appels sur toute fenêtre glissante de 30 jours ». Et l'implémenter
ainsi évite de stocker une file d'horodatages par clé.

**Coût.** Ce n'est pas un lissage : un canal peut consommer tout son quota le 1er du mois. Pour du
lissage il faudrait un algorithme différent (token bucket), qui répond à un autre besoin — protéger
l'infrastructure, pas facturer l'usage.

---

## ADR-6 — Un catalogue généré plutôt qu'un jeu de données figé

**Décision.** Les offres sont produites à partir d'un graphe de lignes fictives, sur 21 jours
glissants, de façon déterministe (hachage FNV-1a de l'identifiant d'offre).

**Pourquoi.** Une démonstration dont le catalogue expire au bout d'une semaine ne se montre pas en
entretien. Le déterminisme est ce qui rend les tests possibles : le même identifiant donne toujours
le même remplissage, donc les mêmes tarifs.

**Coût.** Les pages qui affichent des exemples doivent être régénérées régulièrement (ISR, une
heure) pour que les valeurs de départ du portail restent des valeurs qui aboutissent.
