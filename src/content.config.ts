import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { workSchema } from './lib/work-schema';

const article = z.object({
  title: z.string(),
  description: z.string(),
  cover: z.string().optional(),
  published: z.coerce.date(),
  updated: z.coerce.date().optional(),
  category: z.string().default('随笔'),
  categorySlug: z.string().regex(/^[a-z0-9-]+$/).default('essays'),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  pin: z.boolean().default(false),
  nid:z.number().int().positive().optional(),
  topic:z.string().optional(),
  mood:z.string().optional(),
  weather:z.string().optional(),
  location:z.string().optional(),
  related:z.array(z.string()).default([]),
  license:z.enum(['reserved','CC-BY-NC-SA-4.0']).default('reserved'),
  images:z.array(z.object({src:z.string(),width:z.number().positive(),height:z.number().positive(),accent:z.string().optional(),blurHash:z.string().optional()})).default([]),
});

export const collections = {
  works: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/works' }), schema: workSchema }),
  posts: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/posts' }), schema: article }),
  notes: defineCollection({ loader: glob({ pattern: '**/*.md', base: './src/content/notes' }), schema: article }),
};
