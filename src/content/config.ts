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
    servings: z.object({
      quantity: z.number(),
      unit: z.string(),
    }),
    freezable: z.boolean().default(false),
    time: z.object({
      prep: z.number(),
      cook: z.number(),
      wait: z.number().default(0),
      soak: z.number().default(0),
    }),
    cooking_method: z.string(),
    ingredients: z.array(z.union([
      z.object({
        quantity: z.string().nullable(),
        unit: z.string().nullable(),
        ingredient: z.string(),
        note: z.string().nullable(),
      }),
      z.object({
        subsection: z.string(),
      }),
    ])),
    optional_ingredients: z.array(z.string()).optional(),
    steps: z.array(z.string()),
    visualSteps: z.array(z.object({
      instruction: z.string(),
      actorRole: z.enum(['adulte', 'enfants']),
      visualElements: z.array(z.object({
        type: z.enum(['container', 'ingredient', 'action', 'tool']),
        image: z.string(),
        label: z.string(),
        quantity: z.string().optional(),
      })),
    })).optional(),
    serving_suggestions: z.array(z.string()).optional(),
    mainCategory: z.string().optional(),
    categories: z.array(z.string()).default(['plat principal']),
    tags: z.array(z.string()).optional(),
    difficulty: z.enum(['facile', 'moyen', 'difficile']).default('moyen'),
    variant: z.enum(['simple', 'avance', 'maternelle']).optional(),
    relatedRecipe: z.string().optional(),
    heroImage: z.string().optional(),
    pubDate: z.coerce.date().default(() => new Date()),
    draft: z.boolean().default(false),
    tips: z.string().optional(),
    ingredientIntro: z.string().optional(),
    note: z.string().optional(),
  }),
});

export const collections = { blog, cuisine };