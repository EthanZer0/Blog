import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const upstream='.research/Shiro';
const expected='891bb24cd59aff7c9baaf4d9a3579ca4275da3b7';
assert.equal(execFileSync('git',['-C',upstream,'rev-parse','HEAD'],{encoding:'utf8'}).trim(),expected);
const mappings = Object.fromEntries(['variables','theme','tailwindcss','layer','animation','image-zoom','scrollbar','mask','print','webfont'].map(name => [`${name}.css`,`styles/${name}.css`]));
Object.assign(mappings,{'markdown.css':'components/ui/markdown/markdown.css','markdown-variants.css':'components/ui/markdown/markdown-variants.css','Shiki.css':'components/ui/code-highlighter/shiki/Shiki.css','Gallery.css':'components/ui/gallery/Gallery.css','ZoomedImage.css':'components/ui/image/ZoomedImage.css'});
const normalize = source => source.replace(/\r\n/g,'\n').replace(/^@reference[^\n]*\n/gm,'').replace(/^@source[^\n]*\n/gm,'').replace(/\n{2,}/g,'\n\n').trim();
for (const [local,original] of Object.entries(mappings)) {
  assert.equal(normalize(await readFile(`src/styles/upstream/${local}`,'utf8')),normalize(await readFile(`${upstream}/apps/web/src/${original}`,'utf8')),`${local}: unexpected style divergence`);
}
assert.equal((await readFile('src/components/upstream/spring.ts','utf8')).replace(/\r\n/g,'\n'),(await readFile(`${upstream}/apps/web/src/constants/spring.ts`,'utf8')).replace(/\r\n/g,'\n'));
const pkg = JSON.parse(await readFile('package.json','utf8'));
const originalPkg = JSON.parse(await readFile(`${upstream}/apps/web/package.json`,'utf8'));
for (const name of ['react','react-dom','tailwindcss','daisyui','motion','shiki','@shikijs/transformers','vaul','medium-zoom','react-photo-view','@tailwindcss/typography','@egoist/tailwindcss-icons']) assert.equal(pkg.dependencies[name],originalPkg.dependencies[name] || originalPkg.devDependencies[name],`${name}: upstream version mismatch`);
console.log(`Verified ${Object.keys(mappings).length} upstream stylesheets and all spring constants against ${expected}. Shared rendering dependencies match; only @reference/@source and blank lines are normalized.`);
