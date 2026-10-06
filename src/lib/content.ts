import { getCollection, type CollectionEntry } from 'astro:content';
export { withBase } from './url';

export type Entry = CollectionEntry<'posts'> | CollectionEntry<'notes'>;

export async function articles(collection: 'posts' | 'notes') {
  const entries = await getCollection(collection, ({ data }) => !data.draft);
  const paths = new Set<string>();
  for (const entry of entries) {
    const path = articlePath(entry);
    if (paths.has(path)) throw new Error(`Duplicate article URL: ${path}`);
    paths.add(path);
  }
  return entries.sort((a, b) => b.data.published.getTime() - a.data.published.getTime());
}

export function articlePath(entry: Entry) {
  return entry.collection === 'posts'
    ? `/posts/${entry.data.categorySlug}/${entry.data.slug}/`
    : `/notes/${entry.data.nid ?? entry.data.slug}/`;
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai' }).format(date);
}

export const tagPath = (tag: string) => `/posts/tag/${encodeURIComponent(tag)}/`;
