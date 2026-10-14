import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

export const CATEGORIES = {
  photographie: 'Photographie',
  faune: 'Faune',
  musique: 'Musique',
} as const;

export type Category = keyof typeof CATEGORIES;

const posts = defineCollection({
  loader: glob({ pattern: '*/index.md', base: './src/content/posts' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      category: z.enum(['photographie', 'faune', 'musique']),
      cover: image(),
      coverAlt: z.string(),
      gallery: z
        .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
        .default([]),
      tracks: z
        .array(z.object({ title: z.string(), src: z.string(), duration: z.string().optional() }))
        .default([]),
      location: z.string().optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { posts };
