import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve(process.argv[2] || 'dist');
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
// Runtime-injected Vaul styles disappear on Astro head swaps. Every real page
// must load its animation definitions from a bundled stylesheet instead.
const drawerStylesheets = new Set();
for (const file of outputFiles.filter(file => file.endsWith('.css'))) {
  const css = await readFile(file, 'utf8');
  if (['slideFromBottom', 'slideToBottom', 'fadeIn', 'fadeOut'].every(name =>
    new RegExp(`@keyframes\\s+${name}\\s*\\{`).test(css)) && css.includes('[data-vaul-drawer]')) {
    drawerStylesheets.add(path.resolve(file));
  }
}
for (const file of outputFiles.filter(file => file.endsWith('.html'))) {
  const html = await readFile(file, 'utf8');
  const $ = load(html);
  pages.set(file, $);
  const redirect = $('meta[http-equiv=refresh]').length > 0;
  if (!redirect && $('h1').length !== 1) errors.push(`${path.relative(root,file)}: expected one h1, found ${$('h1').length}`);
  if (!redirect && $('#main').length !== 1) errors.push(`${file}: missing main navigation target`);
  if (!redirect) {
    const hasDrawerStyles = $('link[rel="stylesheet"]').toArray().some(element => {
      const url = new URL($(element).attr('href'), site);
      return url.origin === site.origin && drawerStylesheets.has(path.resolve(root, `.${decodeURIComponent(url.pathname.slice(base.length))}`));
    });
    if (!hasDrawerStyles) errors.push(`${path.relative(root,file)}: missing bundled drawer animations (unsafe across route swaps)`);
    const relative = path.relative(root, file).split(path.sep).join('/');
    const pagePath = relative === 'index.html' ? '' : relative.replace(/index\.html$/, '');
    const expected = new URL(`${base}/${pagePath}`, site).href;
    if ($('link[rel="canonical"]').attr('href') !== expected) errors.push(`${relative}: canonical does not match deployment URL ${expected}`);
    if ($('meta[property="og:url"]').attr('content') !== expected) errors.push(`${relative}: og:url does not match deployment URL ${expected}`);
  }
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
  if ($('astro-island[component-url*="Hero"]').length && !$('.hero-title').text().trim()) errors.push('Hero missing static text');
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
if (rss('channel > link').text() !== new URL(`${base}/`, site).href) errors.push('RSS channel URL does not match deployment homepage');
// Only published posts and notes are RSS entries; works/about reuse reader hooks.
const articleCount = [...pages.values()].filter($ => $('[data-content-kind=posts], [data-content-kind=notes]').length > 0).length;
if(rss('item').length !== articleCount) errors.push(`RSS has ${rss('item').length} items for ${articleCount} published article pages`);
for(const link of rss('item > link').toArray()) await checkUrl(rss(link).text(),path.join(root,'index.html'));
if(errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Verified ${pages.size} HTML pages: routes, anchors, assets, RSS, draft isolation and static runtime. Base: ${base || '/'}`);
