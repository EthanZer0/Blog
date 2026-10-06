export function withBase(path: string) {
  if (/^(?:https?:|mailto:|#)/.test(path)) return path;
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}
