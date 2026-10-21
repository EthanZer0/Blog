import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { visit } from 'unist-util-visit';

const root = fileURLToPath(new URL('../../', import.meta.url));
const publicDir = path.join(root, 'public');
const cache = path.join(root, 'node_modules/.cache/blog-images');
const pending = new Map();
const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
const inside = (folder, file) => { const relative = path.relative(folder, file); return relative && !relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative); };
function losslessWebp(bytes) {
  if (bytes.subarray(8, 12).toString('ascii') !== 'WEBP') return false;
  for (let at = 12; at + 8 <= bytes.length;) { const size = bytes.readUInt32LE(at + 4); if (bytes.subarray(at, at + 4).toString('ascii') === 'VP8L') return true; at += 8 + size + size % 2; }
  return false;
}

export async function responsiveImage(source, sizes = '(max-width: 768px) 100vw, 960px', options = {}) {
  const publicRoot = options.publicDir || publicDir, cacheRoot = options.cacheDir || cache;
  if (typeof source !== 'string' || !source.startsWith('/') || source.startsWith('//')) return {};
  let name;
  try { name = decodeURIComponent(source.split(/[?#]/)[0]); } catch { return {}; }
  if (!/\.(?:png|jpe?g|webp)$/i.test(name)) return {};
  const file = path.resolve(publicRoot, `.${name}`);
  if (!inside(publicRoot, file)) return {};
  let real, stat;
  try { real = await fs.realpath(file); stat = await fs.stat(real); } catch (error) { if (error.code === 'ENOENT') return {}; throw error; }
  if (!inside(await fs.realpath(publicRoot), real)) return {};
  const key = `${cacheRoot}:${real}:${stat.mtimeMs}:${stat.size}`;
  if (!pending.has(key)) pending.set(key, generate(real, cacheRoot).catch(error => { pending.delete(key); throw error; }));
  const result = await pending.get(key);
  return result.srcset ? { ...result, sizes } : result;
}

async function generate(file, cacheRoot) {
  const bytes = await fs.readFile(file);
  const meta = await sharp(bytes, { limitInputPixels: 60000000 }).metadata();
  if (meta.pages > 1) return {};
  const rotated = meta.autoOrient || meta;
  const width = rotated.width, height = rotated.height;
  const dimensions = { width, height };
  if (bytes.length < 32768) return dimensions;
  const digest = createHash('sha256').update('web-v2:sharp-0.35.5:').update(bytes).digest('hex').slice(0, 24);
  const widths = [...new Set([240, 480, 800, 1200, Math.min(width, 1920)].filter(w => w <= width && w <= 1920))].sort((a, b) => a - b);
  await fs.mkdir(cacheRoot, { recursive: true });
  const variants = [];
  for (const target of widths) {
    const name = `${digest}-${target}.webp`, destination = path.join(cacheRoot, name);
    try { await fs.access(destination); } catch {
      const output = await sharp(bytes, { limitInputPixels: 60000000 }).rotate().resize({ width: target, withoutEnlargement: true }).webp({ quality: 80, lossless: meta.format === 'png' || losslessWebp(bytes), effort: 4 }).toBuffer();
      // 只有比源文件小的变体才值得让浏览器下载。
      if (output.length >= bytes.length) continue;
      const temporary = `${destination}.${process.pid}.tmp`;
      await fs.writeFile(temporary, output); await fs.rename(temporary, destination);
    }
    variants.push(`${base}/_blog-images/${name} ${target}w`);
  }
  return variants.length ? { ...dimensions, srcset: variants.join(', ') } : dimensions;
}

export function rehypeResponsiveImages(options = {}) {
  return async tree => {
    const nodes = [];
    visit(tree, 'element', node => { if (node.tagName === 'img' && !node.properties?.srcSet) nodes.push(node); });
    // 限制并发，避免图集构建时同时解码大量原图。
    for (const node of nodes) {
      const props = node.properties ||= {};
      const image = await responsiveImage(props.src, undefined, options);
      if (!props.width && !props.height) { props.width = image.width; props.height = image.height; }
      if (image.srcset) { props.srcSet = image.srcset; props.sizes = image.sizes; }
      props.decoding = 'async';
    }
  };
}

export function responsiveImagesIntegration() {
  return { name: 'blog-responsive-images', hooks: {
    'astro:server:setup': ({ server }) => {
      server.middlewares.use(async (request, response, next) => {
        const name = request.url?.split('?')[0]?.match(/\/_blog-images\/([a-f0-9]{24}-\d+\.webp)$/)?.[1];
        if (!name) return next();
        try { const bytes = await fs.readFile(path.join(cache, name)); response.setHeader('Content-Type', 'image/webp'); response.setHeader('Cache-Control', 'public, max-age=31536000, immutable'); response.end(bytes); }
        catch { next(); }
      });
    },
    'astro:build:done': async ({ dir }) => {
      const output = fileURLToPath(dir), names = new Set();
      async function scan(folder) {
        for (const entry of await fs.readdir(folder, { withFileTypes: true })) {
          const file = path.join(folder, entry.name);
          if (entry.isDirectory()) await scan(file);
          else if (entry.name.endsWith('.html')) {
            const html = await fs.readFile(file, 'utf8');
            for (const match of html.matchAll(/\/_blog-images\/([a-f0-9]{24}-\d+\.webp)/g)) names.add(match[1]);
          }
        }
      }
      await scan(output);
      if (names.size) await fs.mkdir(path.join(output, '_blog-images'), { recursive: true });
      for (const name of names) await fs.copyFile(path.join(cache, name), path.join(output, '_blog-images', name));
    },
  } };
}
