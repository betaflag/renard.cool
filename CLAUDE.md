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

# Generate recipe images using Google Gemini AI
npm run gemini -- [OPTIONS] <prompt> <filename>
# Example: npm run gemini -- -d ./public/cuisine "un risotto aux champignons steampunk" risotto-champignons
# Requires: GEMINI_API_KEY environment variable
```

## Project Architecture

### Directory Structure
- `src/pages/` - Astro page components (file-based routing)
  - `index.astro` - Main portfolio landing page
  - `blog/` - Blog system with listing and individual post pages
  - `blog/categories/` - Category-specific blog listings
  - `cuisine/` - Recipe system with listing and detail pages
  - `meteo/` - Weather application module
  - `kinoba.astro` - Additional page
- `src/content/` - Content collections for structured content
  - `blog/` - Markdown files for blog posts
  - `cuisine/` - JSON recipe files with structured data
- `src/components/` - Reusable Astro components
  - `MealPlanWidget.astro` - Meal planning dropdown widget
  - `ShoppingListWidget.astro` - Shopping list dropdown widget
  - `RecipeDetailNav.astro` - Navigation for recipe pages
- `src/lib/` - Client-side JavaScript utilities
  - `meal-plan-manager.js` - localStorage manager for meal planning
  - `shopping-list-manager.js` - localStorage manager for shopping list
- `public/` - Static assets served directly
  - Images, icons, CNAME file for custom domain
  - Weather app static resources in `public/meteo/`
  - Recipe images in `public/cuisine/`
- `bin/` - CLI utilities
  - `gemini.ts` - Google Gemini AI image generator
- `_docs/` - Internal documentation
  - `guide-images-recettes.md` - Recipe image creation guide

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

### Recipe System (Cuisine)
- **Content Collections**: Recipes stored as JSON files with structured data validated by Zod schemas
- **Structured Ingredients**: Ingredients use objects with `quantity`, `unit`, `ingredient`, `note` fields (or `subsection` for grouping)
- **Meal Planning**: Client-side feature using localStorage to save recipes for weekly planning
- **Shopping List**: Client-side feature to add individual ingredients from recipes, grouped by recipe
- **localStorage Sync**: Uses custom events (`mealPlanUpdated`, `shoppingListUpdated`) to sync UI across components
- **Data Flow**: Server-side data passed to client scripts via `data-*` attributes on HTML elements

### Key Design Patterns
- Each page is a self-contained Astro component with inline styles
- Heavy use of CSS animations and visual effects (smoke, glow, floating)
- Responsive design with mobile-first breakpoints
- Dark theme with orange accent colors (#ff6b00 for main site, #d35400 for recipes)
- Client-side state management using localStorage with custom event sync
- Dynamic z-index management using CSS `:has()` selector for overlapping dropdowns

## Creating Blog Posts

To add a new blog post:
1. Create a new `.md` file in `src/content/blog/`
2. Add frontmatter with required fields:
   - title, description, pubDate, categories
3. Write content in Markdown
4. Posts appear automatically on the blog and category pages

## Creating Recipes

To add a new recipe:
1. Create a new `.json` file in `src/content/cuisine/`
2. Follow the Zod schema structure (see `src/content/config.ts`)
3. Required fields: name, description, servings, time (prep, cook), cooking_method, ingredients, steps
4. Ingredients must be objects with: `{ quantity, unit, ingredient, note }` or `{ subsection }`
5. Generate hero image using: `npm run gemini -- -d ./public/cuisine "<prompt>" <filename>`
6. See `_docs/guide-images-recettes.md` for image generation guidelines
7. Set `draft: false` when ready to publish
- Utilise toujours des farenheights au lieu des celsius pour tout ce qui est cuisson