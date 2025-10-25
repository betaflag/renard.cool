# Guide des Recettes Camps Scout

## Vue d'ensemble

La section **Camps Scout** est une collection de recettes spécialement conçues pour les camps scouts avec accès à une cuisine complète. Ces recettes sont optimisées pour nourrir de grands groupes d'enfants (typiquement 15-25 personnes incluant animateurs) avec un focus sur la praticité, la participation des enfants, et l'aspect visuel impressionnant.

## Architecture

### Structure des fichiers

```
src/
  content/
    cuisine/
      [nom-recette]-camps-scout.json    # Fichiers de recettes
  pages/
    cuisine/
      main/
        camps-scout.astro                # Page dédiée Camps Scout
      [...slug].astro                    # Thème scout appliqué ici
  components/
    CuisineNav.astro                     # Navigation avec bouton scout

public/
  cuisine/
    [nom-recette]-camps-scout.png        # Images des recettes
```

### Filtrage et navigation

- Les recettes avec `mainCategory: "Camps Scout"` sont automatiquement filtrées de la page principale
- Elles apparaissent uniquement sur `/cuisine/main/camps-scout`
- Un bouton dédié "Camps Scout" dans la navigation permet d'accéder à la section

## Création de recettes de camp

### Principes de base

1. **Grandes portions** : Toujours calculer pour le groupe complet (ex: 17 enfants + 5 adultes = 22 portions)
2. **Praticité** : Privilégier les recettes avec peu de vaisselle, préparation simple, et cuisson rapide
3. **Participation** : Intégrer des opportunités pour que les enfants aident (assemblage, garnitures, etc.)
4. **Facteur WOW** : Choisir des recettes visuellement impressionnantes qui créent de l'excitation
5. **Timeline claire** : Toujours inclure les temps de préparation réalistes au camp

### Champs JSON spécifiques aux camps scouts

En plus des champs standard, les recettes de camp utilisent :

```json
{
  "mainCategory": "Camps Scout",
  "scoutCount": 22,
  "scoutContext": [
    "cuisine extérieure",
    "préparation rapide",
    "grandes portions"
  ],
  "freezable": true,  // Important pour les make-ahead
  "difficulty": "facile"
}
```

#### `scoutCount` (nombre)
Nombre exact de personnes servies (enfants + animateurs)

#### `scoutContext` (array)
Tags contextuels parmi :
- `"feu de camp"` - Recettes adaptées au feu extérieur
- `"bivouac"` - Recettes pour camps sans cuisine complète
- `"cuisine extérieure"` - Peut se faire dehors
- `"matériel minimal"` - Équipement de base seulement
- `"grandes portions"` - Optimisé pour groupes 15+
- `"préparation rapide"` - Moins de 30 min active

### Structure d'une recette de camp exemplaire

#### 1. Description engageante
Mettez l'accent sur l'aspect pratique ET l'aspect fun :

```json
{
  "description": "Le secret des matins sans stress au camp! Ces burritos se préparent entièrement à la maison, se congèlent, et se réchauffent au four pendant que les castors s'habillent."
}
```

#### 2. Ingrédients organisés par subsections

```json
{
  "ingredients": [
    { "subsection": "Base (préparer d'avance recommandé)" },
    { "quantity": "1,5", "unit": "kg", "ingredient": "bœuf haché", "note": "ou poulet" },
    { "subsection": "Garnitures fraîches (après cuisson)" },
    { "quantity": "500", "unit": "ml", "ingredient": "crème sure", "note": null }
  ]
}
```

#### 3. Étapes avec contexte camp

Les étapes doivent clairement distinguer :
- **À LA MAISON** - Préparation d'avance
- **AU CAMP** - Ce qui se fait sur place
- **PARTICIPATION CASTORS** - Où les enfants peuvent aider

```json
{
  "steps": [
    "PRÉPARATION D'AVANCE (fortement recommandé): Dans une grande marmite, faire revenir 1,5 kg de bœuf haché...",
    "AU CAMP - Préparation: Préchauffer le four à 400°F (200°C)...",
    "ASSEMBLAGE PAR PLAQUE (×4) - ACTIVITÉ CASTORS! Diviser les castors en 4 équipes..."
  ]
}
```

#### 4. Tips détaillés

Le champ `tips` doit couvrir :
- Astuces de préparation
- Gestion du temps (timeline)
- Participation des enfants
- Variantes (végétarien, allergies)
- Budget approximatif par portion

```json
{
  "tips": "ASTUCE #1: NE PAS assembler plus de 10 minutes avant la cuisson... PARTICIPATION DES CASTORS: Diviser en 4 équipes... Budget: environ 8-9$ par castor."
}
```

#### 5. Note avec facteur WOW

```json
{
  "note": "FACTEUR WOW MAXIMUM! Quand vous sortez 4 plaques géantes de nachos fumants et débordants de fromage fondu, les castors perdent la tête... Timeline: pour souper 18h00, commencer à 17h15..."
}
```

## Génération d'images

### Philosophie : Hero Dish + Outdoor Camp

Les images de recettes camps scout combinent deux approches :

1. **Hero Dish** (70% du cadre) : La nourriture est la star
2. **Camp Atmosphere** (30% du cadre) : Éléments de camp et touches steampunk subtiles

### Principes visuels

#### Composition
- **Dominance alimentaire** : 65-70% de l'image = nourriture
- **Setting outdoor** : Table de pique-nique, surface de bois, contexte nature
- **Props de camp** : Lanterne vintage, équipement scout, feu de camp en arrière-plan flou
- **Fantasy subtile** : Petite figurine de renard steampunk, particules de lumière magiques

#### Éclairage
- **Golden hour** : Lumière chaude de fin d'après-midi/début de soirée
- **Feu de camp** : Lueur orangée subtile en background
- **Naturel** : Pas de studio lighting, mais lumière douce et diffuse
- **Steam/vapeur** : Pour les plats chauds, ajoute du réalisme

#### Profondeur de champ
- **Shallow DOF** : Nourriture nette au premier plan
- **Arrière-plan flou** : Nature, tentes, feu de camp suggérés mais non distractifs

### Prompts Gemini : Patterns qui fonctionnent

#### Pattern 1 : Overhead shot (vue du dessus)
Pour : Nachos, pizzas, plats en plaque, buffets

```
A highly detailed overhead food photography shot of [PLAT PRINCIPAL]
on a [SURFACE] at an outdoor scout camp table. The [PLAT] features
[DESCRIPTION DÉTAILLÉE DES INGRÉDIENTS ET COULEURS], photographed
with shallow depth of field (f/2.8) with sharp focus on the food.

Outdoor camp setting with natural golden hour lighting casting warm
tones. In the defocused background: blurred campfire glow, canvas
tents, pine trees.

Subtle steampunk whimsy: a small brass fox figurine (2 inches tall)
[ACTION] near the plate, tiny gear-shaped accessories scattered,
soft magical light particles floating.

Rustic camping props in background (blurred): [PROPS SPÉCIFIQUES].
Professional food photography, appetizing presentation, 70% food
dominance, warm earthy color palette with campfire orange accents.
```

**Exemple concret (Nachos)** :
```
A highly detailed overhead food photography shot of a massive sheet
pan of loaded nachos on a rustic wooden outdoor table at a scout camp.
The nachos feature golden tortilla chips completely covered with
melted orange cheddar cheese (showing beautiful cheese pull), seasoned
ground beef, black beans, corn, diced red and green peppers, dollops
of white sour cream, fresh cilantro leaves, and jalapeño slices.

Outdoor camp setting with natural golden hour lighting (5pm) casting
warm amber tones across the scene. Shallow depth of field (f/2.8)
with sharp focus on the center of the nachos. In the defocused
background: soft glow of a campfire, blurred canvas scout tents,
pine forest silhouettes.

Subtle steampunk whimsy: a small brass fox figurine (2 inches) in
a tiny chef's apron holding a miniature ladle, positioned at the
edge of the pan. Few tiny brass gears (quarter-size) scattered on
table. Very subtle magical light particles (firefly-like) floating
in the background air.

Background props (all softly blurred): vintage brass camping lantern
with warm glow, stack of enamel camping plates, wooden serving spoons,
small bowls of extra toppings (salsa, guacamole). Professional food
photography, mouthwatering presentation, 70% food dominance, warm
color palette dominated by cheese orange, campfire amber, and forest
greens.
```

#### Pattern 2 : 45-degree hero angle
Pour : Burritos, sandwiches, burgers, plats individuels

```
A professional food photography shot at 45-degree angle of [PLAT]
on a [SURFACE] at an outdoor scout camp. [DESCRIPTION DU PLAT -
texture, couleurs, garnitures visibles]. One [ITEM] is cut open to
reveal the [FILLING DESCRIPTION] - layers of [INGRÉDIENTS].

Shot with shallow depth of field (f/2.0), sharp focus on the cut
[ITEM], soft bokeh background. Natural morning/evening light with
[STEAM/GLOW] rising. Outdoor camp atmosphere with [BACKGROUND ELEMENTS].

Whimsical touch: miniature steampunk fox figurine (2 inches)
[ACTION MIGNONNE], [PROPS STEAMPUNK SUBTILS]. Soft magical [EFFET].

Background (blurred): [PROPS DE CAMP]. 65% food dominance, [COLOR
PALETTE], appetizing and inviting composition.
```

**Exemple concret (Burritos)** :
```
A professional food photography shot at 45-degree angle of breakfast
burritos on a weathered wooden cutting board at an outdoor scout camp
table. Two large flour tortilla burritos, one whole wrapped in foil
showing golden-brown tortilla, one cut in half revealing the colorful
filling - fluffy scrambled eggs (bright yellow), crispy sausage rounds,
golden hash browns, melted cheddar cheese, and sautéed red and green
peppers.

Shot with shallow depth of field (f/2.0), razor-sharp focus on the
cut burrito's interior, soft bokeh on background. Natural morning
light (7am golden hour) streaming from left, gentle steam wisps rising
from the hot filling. Outdoor camp atmosphere with misty forest in
far background.

Whimsical touch: tiny steampunk fox figurine (2 inches tall) sitting
on a miniature brass camp stool, appearing to read a tiny recipe book.
Small brass compass and gear pendant on table. Very faint sparkles
of morning dew catching light.

Background (all softly blurred): vintage enamel camping mug with
coffee steam, small glass jar of salsa, white bowl of sour cream,
brass camping lantern with soft glow, canvas tent corner, pine
branches. 65% food dominance, warm color palette of golden yellows,
breakfast oranges, and morning greens, appetizing and inviting
composition.
```

#### Pattern 3 : Close-up immersif
Pour : Textures (cheese pull, garnitures, détails)

```
An immersive close-up food photography macro shot of [DÉTAIL SPÉCIFIQUE]
from [PLAT]. Extreme detail showing [TEXTURES], shot at f/1.8 with
[ELEMENT PRINCIPAL] in sharp focus and immediate surroundings softly
blurred.

[DESCRIPTION LUMIÈRE ET ATMOSPHÈRE]. Background: heavily defocused
[CONTEXTE CAMP].

Tiny steampunk details: [PROPS MINIATURES]. [EFFET MAGIQUE SUBTIL].

[COLOR PALETTE], professional food macro photography, 80% food detail
dominance.
```

### Commande Gemini

```bash
# Pattern de base
npm run gemini -- -d ./public/cuisine -a 3:2 "[PROMPT]" [nom-fichier]

# Exemples concrets
npm run gemini -- -d ./public/cuisine -a 3:2 "A highly detailed overhead..." nachos-plaque-camps-scout

npm run gemini -- -d ./public/cuisine -a 3:2 "A professional food photography..." burritos-dejeuner-camps-scout

# Aspect ratio recommandé : 3:2 (1248x832) pour hero images
```

### Checklist qualité image

Avant de valider une image générée, vérifier :

- [ ] **Dominance alimentaire** : 65-70% de l'image est la nourriture
- [ ] **Nourriture appétissante** : Couleurs vives, textures visibles, aspect frais
- [ ] **Focus net** : Le plat principal est parfaitement net (pas flou)
- [ ] **Contexte camp** : Éléments de camping visibles mais flous en arrière-plan
- [ ] **Steampunk subtil** : Figurine de renard + 1-2 accessoires discrets maximum
- [ ] **Éclairage naturel** : Pas de studio lighting, lumière chaude et naturelle
- [ ] **Props cohérents** : Équipement de camp réaliste (lanterne, vaisselle émail, etc.)
- [ ] **Magie discrète** : Particules de lumière ou lueur très subtiles si présentes
- [ ] **Couleurs chaudes** : Palette orange/brun/vert forêt cohérente avec le thème

### Erreurs à éviter

❌ **Trop de fantasy** : Renard en taille réelle, accessoires steampunk dominants, décor victorien
- Fix : Limiter à 1 petite figurine (2 inches) + max 2-3 accessoires discrets

❌ **Nourriture secondaire** : Décor de camp qui prend plus de place que la nourriture
- Fix : Recadrer sur la nourriture, flouter davantage l'arrière-plan

❌ **Lighting studio** : Éclairage artificiel trop parfait, fonds blancs
- Fix : Spécifier "natural outdoor golden hour lighting", "weathered wood table"

❌ **Props modernes** : Vaisselle moderne, équipement plastique
- Fix : Utiliser "vintage enamel camping plates", "brass lantern", "canvas tents"

❌ **Trop sombre** : Thème "dark camp" interprété littéralement
- Fix : Toujours inclure "golden hour", "warm lighting", "soft glow"

## Thème visuel scout

### Palette de couleurs

La section Camps Scout utilise un thème dark avec accents de feu de camp :

```css
/* Verts forêt (backgrounds) */
--scout-green-dark: #2d5016
--scout-green-medium: #3d6820
--scout-green-light: #4a7c25

/* Orange feu de camp (accents) */
--scout-orange: #d35400
--scout-orange-bright: #ff6b00

/* Bruns terre (cards, borders) */
--scout-brown: #8b4513
--scout-brown-dark: #5a4a3a

/* Crème (texte sur dark) */
--scout-cream: #f4e4c1
```

### Éléments stylisés

- **Boutons** : Gradient vert forêt avec glow orange au hover
- **Cards** : Background brun semi-transparent avec bordure verte
- **Badges** : Pills avec background orange feu de camp
- **Icons** : Utiliser 🏕️ 🔥 🌲 pour décoration

## Exemples de recettes réussies

### 1. Nachos sur Plaque Géante
- **Pourquoi ça marche** : Visuel impressionnant, participation des enfants (4 équipes), cuisson simple
- **Image** : Vue overhead avec cheese pull, figurine fox chef, props camping
- **Scout context** : `["cuisine extérieure", "préparation rapide", "grandes portions"]`

### 2. Burritos Déjeuner Préparés d'Avance
- **Pourquoi ça marche** : Make-ahead complet, zéro stress le matin, congélation
- **Image** : 45-degree angle montrant filling, steam matinal, fox reading recipe
- **Scout context** : `["préparation rapide", "matériel minimal", "grandes portions"]`

### 3. Walking Tacos
- **Pourquoi ça marche** : Zero vaisselle, service buffet interactif, transportable
- **Image** : Overhead Fritos bags ouverts avec garnitures, bar setup
- **Scout context** : `["cuisine extérieure", "matériel minimal", "grandes portions"]`

## Timeline de création

Pour créer une nouvelle recette de camp :

1. **Recherche** (30 min) : Trouver recettes éprouvées pour camps scouts, vérifier scalabilité
2. **Calculs** (15 min) : Ajuster portions pour le nombre exact d'enfants + animateurs
3. **Rédaction** (45 min) : Créer JSON avec sections AVANCE/CAMP, participation enfants, timeline
4. **Génération image** (20 min) : Écrire prompt détaillé, générer, valider checklist
5. **Tests** (optionnel) : Si possible, tester la recette avant le camp!

## Ressources

- Guide général images : `_docs/guide-images-recettes.md`
- Exemples de recettes : `src/content/cuisine/*-camps-scout.json`
- Thème scout : `src/pages/cuisine/[...slug].astro` (section `.scout-theme`)
- Gemini CLI docs : `bin/gemini.ts`

---

**Dernière mise à jour** : Janvier 2025
**Recettes actives** : 3 (Walking Tacos, Burritos Déjeuner, Nachos Plaque)
