import type { APIContext } from 'astro';
import { withBase } from '../lib/url';
export function GET({ site }: APIContext) {
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(withBase('/sitemap-index.xml'), site).href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
