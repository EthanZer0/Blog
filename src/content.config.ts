import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const article = z.object({
  title: z.string(),
  description: z.string(),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  category: z.string().default('随笔'),
  categorySlug: z.string().regex(/^[a-z0-9-]+$/).default('essays'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  pin: z.boolean().default(false),
});

export const collections = {
  posts: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/posts' }), schema: article }),
  notes: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/notes' }), schema: article }),
};
