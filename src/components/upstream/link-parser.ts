const GITHUB_HOST='github.com';
export const isXiaoHongShuUrl = (url: URL) =>
  url.hostname.includes('xiaohongshu.com')
export const isGithubUrl = (url: URL) => url.hostname === GITHUB_HOST
export const isTwitterUrl = (url: URL) =>
  url.hostname === 'twitter.com' || url.hostname === 'x.com'
export const isTelegramUrl = (url: URL) => url.hostname === 't.me'
export const isBilibiliUrl = (url: URL) => url.hostname.includes('bilibili.com')
export const isZhihuUrl = (url: URL) => url.hostname === 'www.zhihu.com'
export const isWikipediaUrl = (url: URL) =>
  url.hostname.includes('wikipedia.org')
export const isTMDBUrl = (url: URL) => url.hostname.includes('themoviedb.org')
export const isFigmaUrl = (url: URL) => {
  return url.hostname.includes('figma.com')
}
export const isNpmUrl = (url: URL) => {
  return url.hostname.includes('npmjs.com')
}
export const isMozillaUrl = (url: URL) => url.hostname.includes('mozilla.org')
