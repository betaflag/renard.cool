---
title: "Premier Joueur : Une app pour décider qui commence"
description: "Création d'une application de lancer de dés pour déterminer l'ordre de jeu"
pubDate: 2025-01-22
categories: ["projets", "technologie"]
tags: ["JavaScript", "Animation CSS", "Jeux"]
draft: false
---

Qui n'a jamais eu de débat interminable pour savoir qui commence une partie ? J'ai créé **Premier Joueur**, une petite application web pour régler cette question une fois pour toutes.

## Le concept

L'idée est simple mais efficace :
- Chaque joueur lance les dés à tour de rôle
- L'application garde en mémoire les scores
- À la fin, elle annonce le vainqueur avec panache

## Les fonctionnalités

### Configuration flexible
- Ajout dynamique de joueurs (jusqu'à 10)
- Choix entre 1 ou 2 dés
- Interface intuitive et responsive

### Animations immersives
Les dés ne sont pas de simples nombres affichés. J'ai créé des dés en 3D avec CSS qui tournent réellement lors du lancer, ajoutant une dimension ludique à l'expérience.

```css
.die {
  transform-style: preserve-3d;
  animation: roll 1.5s ease-out;
}
```

### Expérience utilisateur soignée
- Transitions fluides entre les phases de jeu
- Animations de victoire pour célébrer le gagnant
- Classement complet des scores

## Défis techniques

### Dés 3D en CSS pur
Le plus gros défi était de créer des dés réalistes sans utiliser de bibliothèque 3D. En utilisant `transform-style: preserve-3d` et en positionnant six faces avec des transformations 3D, j'ai pu créer l'illusion parfaite.

### Gestion d'état
L'application gère trois phases distinctes :
1. **Configuration** - Ajout des joueurs
2. **Lancer** - Tour par tour avec animations
3. **Résultats** - Annonce du vainqueur et classement

## Technologies utilisées

- **Astro** pour le framework
- **CSS 3D Transforms** pour les animations de dés
- **JavaScript vanilla** pour la logique de jeu
- **Design responsive** pour une utilisation sur tous les appareils

## Résultat

L'application est maintenant disponible sur le portfolio. Elle transforme un simple tirage au sort en moment fun et engageant. Plus de disputes, que le hasard décide !

[Essayer Premier Joueur →](/premier-joueur)