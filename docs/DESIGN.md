# Aiguillage — système de design (v3)

## 1. Qui regarde, et ce qu'il doit ressentir

Le visiteur type est un **recruteur ou un lead technique** qui ouvre le lien depuis une candidature. Il a **30 secondes**, souvent sur un laptop, parfois sur son téléphone entre deux réunions.

Il doit repartir avec trois certitudes :

1. **C'est un produit, pas un exercice.** La finition doit être au niveau d'une vraie API commerciale (Stripe, Railway).
2. **Ça marche pour de vrai.** La démo en direct est au centre de l'écran, et le visiteur obtient une réponse sans rien faire.
3. **L'auteur sait concevoir.** Les preuves techniques sont lisibles, chacune reliée au code.

L'émotion recherchée : *calme, précision, énergie maîtrisée*. On veut un poste d'aiguillage moderne, pas une gare des années 70. La v2 avait le bon récit, mais ses angles vifs et ses capitales condensées faisaient « signalétique imprimée ». La v3 garde l'idée ferroviaire et la traduit dans le langage d'une interface logicielle actuelle.

## 2. Références réelles

| Référence | Ce qu'on lui prend |
|---|---|
| **Stripe Docs** | La hiérarchie des blocs de code, les panneaux d'essai en direct, les rayons généreux et les bordures quasi invisibles. |
| **Linear** (site produit) | Le fond très sombre, légèrement bleuté, le halo lumineux discret derrière le titre, la typographie serrée et nette. |
| **Railway** | Les cartes à coins arrondis avec un reflet en haut, et les badges en pilule pour les statuts. |

## 3. Palette, et pourquoi

La base n'est pas le noir pur mais une **nuit bleutée** : le bleu froid apaise et donne une impression de fiabilité technique. L'accent est un **jaune ambré de signal**. Le jaune est la couleur la plus lisible à distance et il évoque le signal ferroviaire. En plus chaud qu'en v2, il passe de « danger » à « énergie ».

| Rôle | Token | Valeur | Usage |
|---|---|---|---|
| Fond | `rail-950` | `#08090c` | Page |
| Surface 1 | `rail-900` | `#0f1116` | Cartes, panneaux |
| Surface 2 | `rail-850` | `#151820` | Champs, survol, en-têtes de panneau |
| Bordure | `rail-800` | `#232733` | Filets, contours (souvent à 70 % d'opacité) |
| Bordure forte | `rail-700` | `#30354a` | Contour des champs et des boutons secondaires |
| Texte faible | `rail-600` / `rail-500` | `#666d80` / `#7f8799` | Libellés, aides |
| Texte secondaire | `rail-400` / `rail-300` | `#9aa1b2` / `#bec3d0` | Paragraphes |
| Texte principal | `rail-100` | `#f3f4f7` | Titres, valeurs |
| **Accent** | `signal-500` | `#ffc53d` | Action principale, ce qui se lit en premier |
| Accent survol | `signal-400` | `#ffd36e` | Survol, dégradé du mot clé |
| Succès | `vert-500` | `#34d399` | 200, disponible |
| Erreur | `rouge-500` | `#ff6b5b` | 4xx, complet |
| Info | `bleu-400` | `#7aa2ff` | Liens secondaires, halo froid |

Règles :
- **L'accent ne couvre jamais plus de 5 % de l'écran.** Il sert au bouton principal, au mot « en vente », aux heures de départ et à l'arrêt final.
- Toutes les paires texte/fond respectent le **contraste AA** : `rail-300` sur `rail-900` donne 10,9:1 et `rail-500` sur `rail-900` 4,9:1.
- La planche d'architecture est **claire** (`plan-50` `#f5f6f8`), en contrepoint du reste. C'est le moment « plan technique » de la page.

## 4. Typographie

- **Geist** pour toute l'interface et les titres : une grotesque moderne et neutre, très nette à petite taille, avec un vrai gras pour les titres. Elle remplace Archivo condensé, qui faisait affiche.
- **Geist Mono** pour le code, les chemins, les chiffres tabulaires et les étiquettes techniques.

| Niveau | Taille | Graisse | Interlettrage | Interligne |
|---|---|---|---|---|
| Display (h1) | `clamp(2.75rem, 5.4vw, 4.75rem)` | 650 | −0,045em | 1,0 |
| H2 | `clamp(2rem, 3.6vw, 3rem)` | 620 | −0,035em | 1,05 |
| H3 carte | 20–22 px | 600 | −0,02em | 1,2 |
| Corps fort | 17 px | 400 | 0 | 1,6 |
| Corps | 15 px | 400 | 0 | 1,6 |
| Petit | 13 px | 400–500 | 0 | 1,5 |
| Étiquette mono | 11 px | 500 | +0,08em, capitales | 1 |

Les titres sont en **casse normale** : plus de capitales condensées.

## 5. Formes et rayons

| Élément | Rayon |
|---|---|
| Petits contrôles (onglets, jours, chips) | 8–10 px |
| Boutons | 12 px |
| Champs | 10 px |
| Cartes | 16 px |
| Grands panneaux (démo, planche d'architecture) | 24 px |
| Badges et statuts | pilule (999 px) |
| Nœuds du plan de voies | cercles |

Les voies du schéma ont des **extrémités arrondies** et les aiguilles sont des **courbes de Bézier**.

## 6. Profondeur

- Bordures d'un pixel en `white/7 %` : le contour se devine plus qu'il ne se voit.
- Un **reflet en haut des cartes** (`inset 0 1px 0 white/5 %`) et une **ombre douce portée** (`0 20px 50px -20px black/60 %`) sur les panneaux principaux.
- Un **halo** radial ambré et bleu derrière le hero, à moins de 12 % d'opacité. Il donne de la lumière sans dégradé criard.
- Pas de glassmorphism, sauf pour l'en-tête collant : `bg-rail-950/75` avec un léger flou, pour que le contenu reste lisible en dessous.

## 7. Espacements

Échelle de 4 px. Les sections ont **96 px** de marge verticale en bureau et 64 px en mobile. Les cartes ont **24 px** de marge intérieure (20 px en mobile), avec 16 à 24 px de gouttière. La largeur maximale du contenu est de 1240 px.

## 8. Mouvement

- 150 ms pour les survols (couleur, bordure), 200 ms pour la levée d'une carte au survol (−2 px et bordure plus claire).
- Les lignes du tableau des départs s'**allument en cascade**, 220 ms chacune avec 45 ms de décalage.
- La pastille « En service » pulse doucement.
- Tout est désactivé si `prefers-reduced-motion` est actif.

## 9. Composants clés

- **Bouton principal** : fond accent, texte `rail-950`, rayon 12, une légère ombre ambrée au survol.
- **Bouton secondaire** : contour `rail-700`, fond transparent, qui s'éclaire au survol.
- **Pastille de section** (`.pave-voie`) : une pilule ambrée translucide (`signal/12 %`), avec le numéro en mono et une bordure `signal/30 %`. Les numéros de voie restent, en version douce.
- **Carte** (`.carte`) : surface 1, bordure, reflet, rayon 16.
- **Panneau** (`.panneau`) : comme la carte, avec un rayon de 24 et l'ombre portée.
- **Badge de statut** : une pilule teintée (fond de la couleur à 15 %, texte de la couleur).
