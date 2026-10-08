import type { APIRoute } from 'astro';

export async function getStaticPaths() {
  if (!import.meta.env.DEV || process.env.BLOG_WORKBENCH_PREVIEW !== '1') return [];
  return [{ params: { name: 'status' } }];
}

export const GET: APIRoute = () => new Response(JSON.stringify({
  app: 'blog-workbench-preview',
  version: 1,
  root: process.env.BLOG_WORKBENCH_ROOT_ID,
  token: process.env.BLOG_WORKBENCH_TOKEN,
}), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
