import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const upstream='.research/Shiro';
const expected='891bb24cd59aff7c9baaf4d9a3579ca4275da3b7';
assert.equal(execFileSync('git',['-C',upstream,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),expected);
const mappings = Object.fromEntries(['variables','theme','tailwindcss','layer','animation','image-zoom','scrollbar','mask','print','webfont'].map(name => [`${name}.css`,`styles/${name}.css`]));
Object.assign(mappings,{'markdown.css':'components/ui/markdown/markdown.css','markdown-variants.css':'components/ui/markdown/markdown-variants.css','Shiki.css':'components/ui/code-highlighter/shiki/Shiki.css','Gallery.css':'components/ui/gallery/Gallery.css','ZoomedImage.css':'components/ui/image/ZoomedImage.css','LinkCard.css':'components/ui/link-card/LinkCard.css','markdown-renderers.css':'components/ui/markdown/renderers/index.css'});
const normalize = source => source.replace(/\r\n/g,'\n').replace(/^@reference[^\n]*\n/gm,'').replace(/^@source[^\n]*\n/gm,'').replace(/\n{2,}/g,'\n\n').trim();
const normalizeLocal = (local, source) => {
  const normalized = normalize(source);
  // The static port intentionally keeps Shiro's native curtain transition while using 500ms.
  return local === 'variables.css'
    ? normalized.replace(/animation: (turn(?:On|Off)) 500ms ease-in-out/g, 'animation: $1 800ms ease-in-out')
    : normalized;
};
for (const [local,original] of Object.entries(mappings)) {
  assert.equal(normalizeLocal(local, await readFile(`src/styles/upstream/${local}`,'utf8')),normalize(await readFile(`${upstream}/apps/web/src/${original}`,'utf8')),`${local}: unexpected style divergence`);
}
assert.equal((await readFile('src/components/upstream/spring.ts','utf8')).replace(/\r\n/g,'\n'),(await readFile(`${upstream}/apps/web/src/constants/spring.ts`,'utf8')).replace(/\r\n/g,'\n'));
const pkg = JSON.parse(await readFile('package.json','utf8'));
const originalPkg = JSON.parse(await readFile(`${upstream}/apps/web/package.json`,'utf8'));
for (const name of ['react','react-dom','tailwindcss','daisyui','motion','shiki','@shikijs/transformers','vaul','medium-zoom','react-photo-view','@tailwindcss/typography','@egoist/tailwindcss-icons','@floating-ui/react-dom','@radix-ui/react-tabs','@radix-ui/react-select','@radix-ui/react-slider','@radix-ui/react-avatar','react-responsive-masonry','react-blurhash','exif-js','foxact','sonner']) assert.equal(pkg.dependencies[name],originalPkg.dependencies[name] || originalPkg.devDependencies[name],`${name}: upstream version mismatch`);
console.log(`Verified ${Object.keys(mappings).length} upstream stylesheets and all spring constants against ${expected}. Shared rendering dependencies match; only @reference/@source and blank lines are normalized.`);

for(const [local,original] of Object.entries({'MobilePhotoView.tsx':'components/ui/image/MobilePhotoView.tsx','LazyLoad.tsx':'components/common/Lazyload.tsx','color.ts':'lib/color.ts'}))assert.equal(normalize(await readFile('src/components/upstream/'+local,'utf8')),normalize(await readFile(upstream+'/apps/web/src/'+original,'utf8')),local+': unexpected source divergence');
console.log('Verified original MobilePhotoView, LazyLoad and color implementations.');
const fontSource = await readFile(`${upstream}/apps/web/src/components/modules/note/NoteFontFab.tsx`, 'utf8');
const fontIcons = await readFile('src/components/upstream/note-font-icons.tsx', 'utf8');
assert.equal(normalize(fontIcons.slice(fontIcons.indexOf('export const SansFont'))), normalize(fontSource.slice(fontSource.indexOf('export const SansFont'))), 'Note font preview glyphs: unexpected source divergence');
console.log('Verified original note font preview SVGs.');
for (const name of ['Twitter', 'Telegram']) assert.equal(normalize(await readFile(`src/components/upstream/${name}.tsx`, 'utf8')), normalize(await readFile(`${upstream}/apps/web/src/components/icons/platform/${name}.tsx`, 'utf8')), `${name}: unexpected icon divergence`);
console.log('Verified original sharing platform SVGs.');
for (const name of ['Progress', 'status']) {
  const stripUnusedReact = source => normalize(source.replace(/import \* as React from 'react'\r?\n/g, ''));
  assert.equal(stripUnusedReact(await readFile(`src/components/upstream/${name}.tsx`, 'utf8')), stripUnusedReact(await readFile(`${upstream}/apps/web/src/components/icons/${name}.tsx`, 'utf8')), `${name}: unexpected icon divergence`);
}
assert.equal(normalize(await readFile('src/components/upstream/Banner.tsx', 'utf8')), normalize((await readFile(`${upstream}/apps/web/src/components/ui/banner/Banner.tsx`, 'utf8')).replace("'../../icons/status'", "'./status'")), 'Banner: unexpected display divergence');
console.log('Verified original progress/status SVGs and Banner presentation.');
assert.equal(pkg.dependencies['@radix-ui/react-scroll-area'], originalPkg.dependencies['@radix-ui/react-scroll-area'], 'ScrollArea: upstream version mismatch');
const scrollSource = (await readFile(`${upstream}/apps/web/src/components/ui/scroll-area/ScrollArea.tsx`, 'utf8'))
  .replace("import { stopPropagation } from '~/lib/dom'", "const stopPropagation = (event: React.SyntheticEvent) => event.stopPropagation()")
  .replace("import { clsxm } from '~/lib/helper'", "import { clsxm } from './adapters'");
assert.equal(normalize(await readFile('src/components/upstream/ScrollArea.tsx', 'utf8')), normalize(scrollSource), 'ScrollArea: unexpected display divergence');
console.log('Verified original ScrollArea presentation and dependency version.');
