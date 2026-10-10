import { z } from 'astro/zod';

export const workSchema = z.object({
  title: z.string().trim().min(1), slug: z.string().regex(/^[a-z0-9-]+$/),
  type: z.enum(['book','movie','series']), creator: z.string().optional(),
  originalTitle: z.string().optional(), year: z.number().int().positive().optional(),
  cover: z.string().refine(value => /^\/(?!\/)/.test(value) || (/^https:\/\//.test(value) && URL.canParse(value)), 'Cover must be a local absolute path or valid HTTPS URL').optional(),
  status: z.enum(['planned','in-progress','finished']),
  rating: z.number().min(0).max(10).refine(value => Math.abs(value * 10 - Math.round(value * 10)) < 1e-8, 'Rating accepts at most one decimal place').optional(),
  summary: z.string().optional(), recorded: z.coerce.date(), finished: z.coerce.date().optional(),
  review: z.string().optional(), draft: z.boolean().default(false),
});
