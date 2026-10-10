import { getCollection, type CollectionEntry } from 'astro:content';
import { articles, articlePath } from './content';
import { validateWorkSlugs, resolveWorkReview } from './work-records';
export type Work = CollectionEntry<'works'>;
export const workPath = (work: Work) => `/collections/${work.data.slug}/`;
export async function publicWorks() {
  const entries = await getCollection('works');
  validateWorkSlugs(entries);
  const posts = await articles('posts');
  return entries.filter(entry => !entry.data.draft).sort((a,b) => b.data.recorded.getTime() - a.data.recorded.getTime() || a.data.slug.localeCompare(b.data.slug, 'en')).map(entry => {
    const review = resolveWorkReview(entry, posts);
    return { entry, reviewPath: review ? articlePath(review) : undefined };
  });
}
