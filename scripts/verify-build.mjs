import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('dist');
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const site = new URL(process.env.SITE_URL || 'https://example.com');
const errors = [];
const pages = new Map();
async function files(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    result.push(...(entry.isDirectory() ? await files(full) : [full]));
  }
  return result;
}
const outputFiles = await files(root);
for (const file of outputFiles.filter(file => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const $ = load(html);
  pages.set(file, $);
  const redirect = $('meta[http-equiv=refresh]').length > 0;
  if (!redirect && $('h1').length !== 1) errors.push(`${path.relative(root,file)}: expected one h1, found ${$('h1').length}`);
  if (!redirect && $('#main').length !== 1) errors.push(`${file}: missing main navigation target`);
  const ids = new Set();
  $('[id]').each((_, element) => { const id = $(element).attr('id'); if(ids.has(id)) errors.push(`${file}: duplicate id ${id}`); ids.add(id); });
}
async function checkUrl(raw, source, anchor = false) {
  if (!raw || /^(mailto:|tel:|data:|javascript:)/.test(raw)) return;
  const relative = path.relative(root, source).split(path.sep).join('/');
  const sourceUrl = new URL(`${base}/${relative === 'index.html' ? '' : relative.replace(/index\.html$/, '')}`, site);
  const url = new URL(raw, sourceUrl);
  if (url.origin !== site.origin) return;
  if (base && url.pathname !== base && !url.pathname.startsWith(`${base}/`)) { errors.push(`${relative}: missing base in ${raw}`); return; }
  let requested;
  try { requested = decodeURIComponent(url.pathname.slice(base.length)); } catch { errors.push(`${relative}: invalid URL encoding ${raw}`); return; }
  let target = path.join(root, requested);
  try { if ((await stat(target)).isDirectory()) target = path.join(target,'index.html'); await stat(target); }
  catch { errors.push(`${relative}: missing target ${raw}`); return; }
  if (anchor && url.hash && pages.has(target)) {
    const id = decodeURIComponent(url.hash.slice(1));
    const $ = pages.get(target);
    if (!$('[id]').toArray().some(element => $(element).attr('id') === id)) errors.push(`${relative}: missing anchor ${raw}`);
  }
}
for (const [file, $] of pages) {
  if($('[data-article-body] pre').length && !$('[data-shiro-code]').length) errors.push(`${file}: code renderer decoration missing`);
  const headings = $('[data-article-body] :is(h1,h2,h3,h4,h5,h6)').toArray().filter(element => $(element).attr('id') !== 'footnote-label');
  for(const heading of headings) if(!$(heading).find('a.heading-anchor').length) errors.push(`${file}: heading permalink missing`);
  for (const element of $('a[href],img[src],script[src],link[href]').toArray()) {
    const raw = $(element).attr(element.tagName === 'img' || element.tagName === 'script' ? 'src' : 'href');
    await checkUrl(raw, file, element.tagName === 'a');
  }
  for (const element of $('astro-island').toArray()) {
    for (const key of ['component-url','renderer-url']) await checkUrl($(element).attr(key),file);
  }
  if ($('astro-island[component-url*="Hero"]').length && !$.html().includes('Sylvan')) errors.push('Hero missing static text');
}
for (const file of outputFiles.filter(file => /\.(html|xml|json|js|txt)$/.test(file))) {
  const text = await readFile(file,'utf8');
  if (/DRAFT_ISOLATION_SENTINEL|PRIVATE_DRAFT_BODY_SENTINEL/.test(text)) errors.push(`Draft leaked into ${path.relative(root,file)}`);
  if (/api\/v2|socket\.io-client|next\/navigation|next\/headers/.test(text)) errors.push(`Runtime backend dependency: ${path.relative(root,file)}`);
}
for (const required of ['feed.xml','sitemap-index.xml','robots.txt','pagefind/pagefind.js','pagefind/pagefind-ui.js','pagefind/pagefind-ui.css']) {
  try { await stat(path.join(root, required)); } catch { errors.push(`Missing ${required}`); }
}
const rss = load(await readFile(path.join(root,'feed.xml'),'utf8'),{xml:true});
// The about page reuses the reader enhancement hook but is not an RSS entry.
const articleCount = [...pages.entries()].filter(([file, $]) => $('[data-article-body]').length > 0 && !file.endsWith(`${path.sep}about${path.sep}index.html`)).length;
if(rss('item').length !== articleCount) errors.push(`RSS has ${rss('item').length} items for ${articleCount} published article pages`);
for(const link of rss('item > link').toArray()) await checkUrl(rss(link).text(),path.join(root,'index.html'));
if(errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Verified ${pages.size} HTML pages: routes, anchors, assets, RSS, draft isolation and static runtime. Base: ${base || '/'}`);
