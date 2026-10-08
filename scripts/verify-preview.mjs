import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { relatedTargets } from '../src/lib/related.ts';

const post = { collection: 'posts', id: 'article', filePath: 'D:/blog/src/content/posts/folder/source.md', data: { slug: 'article', categorySlug: 'essays' } };
const note = { collection: 'notes', id: 'note', filePath: '/blog/src/content/notes/source.md', data: { slug: 'note', categorySlug: 'essays', nid: 42 } };
for (const reference of ['article', 'posts/folder/source.md', '/posts/essays/article/']) assert.deepEqual(relatedTargets([reference], [post, note]), [post]);
assert.deepEqual(relatedTargets(['/notes/42/', 'notes/source'], [post, note]), [note, note]);
assert.deepEqual(relatedTargets(['article'], [post, { ...note, id: 'article', data: { ...note.data, slug: 'article' } }]), []);
assert.deepEqual(relatedTargets(['missing', 'https://example.com/'], [post, note]), []);
assert.equal(existsSync(new URL('../dist/blog-preview', import.meta.url)), false, 'Private preview routes must not enter the production output');
console.log('Verified related references and production preview-route isolation.');
