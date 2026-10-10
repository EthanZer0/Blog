import { relatedTargets } from './related.ts';

type WorkReference = { id: string; filePath?: string; data: { slug: string; review?: string } };
type Related = Parameters<typeof relatedTargets>[1][number];

export function validateWorkSlugs(entries: WorkReference[]) {
  const slugs = new Set<string>();
  for (const entry of entries) {
    if (slugs.has(entry.data.slug)) throw new Error(`${entry.filePath || entry.id}: duplicate work slug "${entry.data.slug}"`);
    slugs.add(entry.data.slug);
  }
}

export function resolveWorkReview<T extends Related>(entry: WorkReference, posts: T[]) {
  if (!entry.data.review) return undefined;
  const review = relatedTargets([entry.data.review], posts)[0];
  if (!review) throw new Error(`${entry.filePath || entry.id}: review "${entry.data.review}" must resolve to exactly one published post`);
  return review;
}
