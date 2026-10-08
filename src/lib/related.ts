type RelatedEntry = {
  collection: 'posts' | 'notes';
  id: string;
  filePath?: string;
  data: { slug: string; categorySlug: string; nid?: number };
};

export function relatedTargets<T extends RelatedEntry>(references: string[], pool: T[]): T[] {
  return references.flatMap(reference => {
    const key = reference.trim().replace(/\.md$/, '');
    const matches = pool.filter(entry => {
      const fileId = (entry.filePath || '').replaceAll('\\', '/').replace(/^.*src\/content\/(posts|notes)\//, '').replace(/\.md$/, '');
      const url = entry.collection === 'posts' ? `/posts/${entry.data.categorySlug}/${entry.data.slug}/` : `/notes/${entry.data.nid ?? entry.data.slug}/`;
      return key === entry.id || key === entry.data.slug || key === `${entry.collection}/${fileId || entry.id}` || key.replace(/\/?$/, '/') === url;
    });
    return matches.length === 1 ? matches : [];
  });
}
