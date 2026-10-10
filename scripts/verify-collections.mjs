import assert from 'node:assert/strict';
import { workSchema } from '../src/lib/work-schema.ts';
import { readWorkFilters, workFilterQuery, workStatusLabel } from '../src/lib/work-filters.ts';
import { validateWorkSlugs, resolveWorkReview } from '../src/lib/work-records.ts';

const record = { title: '测试作品', slug: 'test-work', type: 'book', status: 'planned', recorded: '2026-10-10' };
assert.equal(workSchema.parse(record).draft, false);
for (const rating of [0, 7.5, 10]) assert.equal(workSchema.parse({ ...record, rating }).rating, rating);
for (const rating of [-1, 10.1, 7.55]) assert.equal(workSchema.safeParse({ ...record, rating }).success, false);
for (const cover of ['/images/collections/test.jpg', 'https://example.com/test.jpg']) assert.equal(workSchema.safeParse({ ...record, cover }).success, true);
for (const cover of ['http://example.com/test.jpg', '//example.com/test.jpg', 'C:/test.jpg', 'https://']) assert.equal(workSchema.safeParse({ ...record, cover }).success, false);
assert.equal(workSchema.safeParse({ ...record, recorded: 'invalid' }).success, false);
for (const type of ['', 'book', 'movie', 'series']) {
  for (const status of ['', 'planned', 'in-progress', 'finished']) {
    const filters = { type, status };
    assert.deepEqual(readWorkFilters(new URLSearchParams(workFilterQuery(filters))), filters);
  }
}
assert.deepEqual(readWorkFilters(new URLSearchParams('type=bad&status=bad')), { type: '', status: '' });
assert.equal(workStatusLabel('finished', true), '已读');
assert.equal(workStatusLabel('finished', false), '已看完');
const entry = { id: 'test', filePath: 'src/content/works/test.md', data: { slug: 'test', review: 'review' } };
const post = { collection: 'posts', id: 'review', data: { slug: 'review', categorySlug: 'essays' } };
assert.throws(() => validateWorkSlugs([entry, entry]), /test\.md: duplicate work slug/);
assert.equal(resolveWorkReview(entry, [post]), post);
assert.throws(() => resolveWorkReview(entry, []), /test\.md: review .*published post/);
assert.throws(() => resolveWorkReview(entry, [post, post]), /exactly one/);
console.log('Verified works schema, optional rating/cover, filter URLs and state labels.');
