# CLAUDE.md

Blog personnel de photographie, de faune et de musique, publié sur renard.cool.
Tout le contenu est en français.

## Stack

Astro (statique, zéro JavaScript côté client), déployé sur GitHub Pages à chaque push sur
`main` via `.github/workflows/deploy.yml`.

```bash
npm install
npm run dev       # localhost:4321
npm run build     # ./dist
npm run check     # astro check (types)
```

## Structure

- `src/content.config.ts` : la collection `posts` et les trois catégories
  (`photographie`, `faune`, `musique`).
- `src/content/posts/<slug>/index.md` : un dossier par billet, images à côté du markdown.
- `src/pages/` : accueil, `[category]`, `[post]`, `rss.xml.ts`, `404`.
- `src/components/` : `PlateList`, `Plate`, `PhotoMeta`, `Tracks`, `Footer`.
- `src/lib.ts` : `publishedPosts()` et `formatDate()`.
- `src/styles/global.css` : papier, encre, typo IM Fell, `.plate`, `.prose`, `.fleuron`.
- `public/audio/` : fichiers audio, référencés par chemin absolu depuis le frontmatter.

## Ajouter un billet

1. Créer `src/content/posts/<slug>/index.md`. Le slug devient l'URL (`/<slug>`).
2. Frontmatter obligatoire : `title`, `description`, `pubDate`, `category`, `cover`,
   `coverAlt`. Optionnel : `location`, `gallery` (liste de `{src, alt, caption}`),
   `tracks` (liste de `{title, src, duration}`), `exif` (`camera`, `lens`, `focal`,
   `aperture`, `shutter`, `iso`, tous optionnels, affichés sous la couverture), `draft`.
3. Déposer les images dans le même dossier et les référencer en relatif (`./cover.jpg`).
   Astro génère les variantes redimensionnées au build.
4. Déposer l'audio dans `public/audio/` et le référencer en absolu (`/audio/fichier.mp3`).
5. `draft: true` masque le billet en production mais le laisse visible en `npm run dev`.

## Conventions

- Styles dans chaque composant (`<style>` scoped), variables globales dans `global.css`.
- Pas de framework UI, pas de JavaScript client sauf besoin réel.
- Les textes alternatifs des images sont obligatoires et décrivent l'image.
