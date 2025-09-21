# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal portfolio website built with Astro, deployed at renard.cool. The site features a mystical fox-themed design with a weather app integration.

**Language**: The site content is always in French. Some applications may include English translations, but French is the primary language for all UI elements and content.

## Tech Stack

- **Framework**: Astro 5.13.5
- **Language**: TypeScript/JavaScript
- **Styling**: Inline CSS (no CSS framework)
- **Deployment**: GitHub Pages via GitHub Actions
- **Domain**: renard.cool (configured via CNAME)

## Commands

```bash
# Install dependencies
npm install

# Start development server (localhost:4321)
npm run dev

# Build production site to ./dist/
npm run build

# Preview production build locally
npm run preview

# Run Astro CLI commands
npm run astro [command]
```

## Project Architecture

### Directory Structure
- `src/pages/` - Astro page components (file-based routing)
  - `index.astro` - Main portfolio landing page
  - `blog/` - Blog system with listing and individual post pages
  - `blog/categories/` - Category-specific blog listings
  - `meteo/` - Weather application module
  - `kinoba.astro` - Additional page
- `src/content/` - Content collections for structured content
  - `blog/` - Markdown files for blog posts
- `public/` - Static assets served directly
  - Images, icons, CNAME file for custom domain
  - Weather app static resources in `public/meteo/`

### Routing
Astro uses file-based routing where each `.astro` file in `src/pages/` becomes a route. Files named `index.astro` within folders create routes at that folder's path.

### Deployment
The site auto-deploys to GitHub Pages on push to main branch via `.github/workflows/deploy.yml`. The workflow:
1. Builds the Astro site
2. Uploads to GitHub Pages artifact
3. Deploys to renard.cool

### Blog System
- **Content Collections**: Blog posts are managed through Astro's content collections
- **Categories**: Posts can be organized by categories (e.g., "projets", "journal", "technologie")
- **Dynamic Routing**: Blog posts and category pages are generated dynamically
- **Metadata**: Each post includes title, description, date, categories, and optional tags

### Key Design Patterns
- Each page is a self-contained Astro component with inline styles
- Heavy use of CSS animations and visual effects (smoke, glow, floating)
- Responsive design with mobile-first breakpoints
- Dark theme with orange accent colors (#ff6b00)

## Creating Blog Posts

To add a new blog post:
1. Create a new `.md` file in `src/content/blog/`
2. Add frontmatter with required fields:
   - title, description, pubDate, categories
3. Write content in Markdown
4. Posts appear automatically on the blog and category pages