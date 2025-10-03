import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

const cuisine = defineCollection({
  type: 'data',
  schema: z.object({
    name: z.string(),
    description: z.string(),
    servings: z.number(),
    freezable: z.boolean().default(false),
    time: z.object({
      prep: z.number(),
      cook: z.number(),
      wait: z.number().default(0),
      soak: z.number().default(0),
    }),
    cooking_method: z.string(),
    ingredients: z.array(z.string()),
    optional_ingredients: z.array(z.string()).optional(),
    steps: z.array(z.string()),
    serving_suggestions: z.array(z.string()).optional(),
    categories: z.array(z.string()).default(['plat principal']),
    difficulty: z.enum(['facile', 'moyen', 'difficile']).default('moyen'),
    variant: z.enum(['simple', 'avance']).optional(),
    relatedRecipe: z.string().optional(),
    heroImage: z.string().optional(),
    pubDate: z.coerce.date().default(() => new Date()),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, cuisine };