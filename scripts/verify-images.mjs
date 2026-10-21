import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';
import { responsiveImage, rehypeResponsiveImages } from '../src/lib/responsive-images.mjs';
import { unified } from 'unified';
const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-images-qa-'));
const options = { publicDir: folder, cacheDir: path.join(folder, 'cache') };
try {
  const pixels = Buffer.alloc(2200*1400*3); for (let i=0;i<pixels.length;i++) pixels[i]=(i*31+(i>>5))%256;
  const file=path.join(folder,'photo.jpg'); await sharp(pixels,{raw:{width:2200,height:1400,channels:3}}).jpeg({quality:98}).toFile(file);
  const source='/photo.jpg', image=await responsiveImage(source,'88px',options);
  assert.equal(image.width,2200);assert.equal(image.height,1400);assert.equal(image.sizes,'88px');assert.match(image.srcset,/240w/);assert.match(image.srcset,/1920w/);
  for(const item of image.srcset.split(', ')){
    const [url,width]=item.split(' '), bytes=await fs.readFile(path.join(options.cacheDir,path.basename(url)));
    assert.equal((await sharp(bytes).metadata()).width,Number(width.slice(0,-1)));assert.ok(bytes.length<(await fs.stat(file)).size);
  }
  assert.deepEqual(await responsiveImage('https://example.com/a.jpg'),{});assert.deepEqual(await responsiveImage('/../package.json'),{});assert.deepEqual(await responsiveImage('/%2e%2e/package.json'),{});
  assert.deepEqual(await responsiveImage('/missing.jpg'),{});
  const tree={type:'root',children:[{type:'element',tagName:'img',properties:{src:source},children:[]}]};
  await unified().use(rehypeResponsiveImages,options).run(tree);assert.equal(tree.children[0].properties.src,source);assert.equal(tree.children[0].properties.srcSet,image.srcset);
  const raw=await fs.readFile(file);await responsiveImage(source,undefined,options);assert.ok((await fs.readFile(file)).equals(raw));
  console.log('Verified responsive variants, dimensions, size savings, original preservation, remote/missing/path guards and Markdown transform.');
}finally{await fs.rm(folder,{recursive:true,force:true});}
