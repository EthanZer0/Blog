// Shiro ShareModal and action geometry, adapted to static routes and the modal stack.
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { MotionButtonBase } from './upstream/MotionButton';
import { TwitterIcon } from './upstream/Twitter';
import { IcBaselineTelegram } from './upstream/Telegram';
import { presentModal } from './ModalRoot';
import { siteConfig } from '../site.config';

function ShareModal({ url, title }: { url: string; title: string }) {
  const text = `嘿，我发现了一片宝藏文章「${title}」哩，快来看看吧！`;
  const open = (base: string, params: Record<string, string>) => window.open(`${base}?${new URLSearchParams(params)}`, '_blank', 'noopener,noreferrer');
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); toast.success('已复制到剪贴板'); }
    catch { toast.error('复制失败，请检查浏览器的剪贴板权限。'); }
  };
  const items = [
    { name: 'Twitter', icon: <TwitterIcon />, action: () => open('https://twitter.com/intent/tweet', { url, text, via: siteConfig.title }) },
    { name: 'Telegram', icon: <IcBaselineTelegram className="text-[#2AABEE]" />, action: () => open('https://telegram.me/share/url', { url, text }) },
    { name: '复制链接', icon: <i className="i-mingcute-copy-fill" />, action: copy },
  ];
  return <div className="relative grid grid-cols-[200px_auto] gap-5 max-[479px]:grid-cols-1">
    <div className="inline-block size-[200px] bg-zinc-200/80 dark:bg-zinc-800/90 max-[479px]:mx-auto">
      <QRCodeSVG value={url} className="aspect-square w-[200px]" height={200} width={200} />
    </div>
    <div className="flex flex-col gap-2">分享到...
      <ul className="w-[200px] flex-col gap-2 [&>li]:flex [&>li]:items-center [&>li]:space-x-2 max-[479px]:mx-auto">
        {items.map(({ name, icon, action }) => <li key={name}>
          <button className="flex w-full cursor-pointer items-center space-x-2 rounded-md px-3 py-2 text-lg transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label={`Share to ${name}`} onClick={action}>{icon}<span>{name}</span></button>
        </li>)}
      </ul>
    </div>
  </div>;
}

export default function ArticleShare({ title, text, path, note, aside = false }: { title: string; text: string; path: string; note: boolean; aside?: boolean }) {
  const [eof, setEof] = useState(false), [pageEnd, setPageEnd] = useState(false);
  useEffect(() => {
    if (!aside) return;
    let previous = window.scrollY, scrollingDown = false;
    const marker = document.querySelector('[data-article-end]');
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || !scrollingDown) setEof(entry.isIntersecting);
    });
    if (marker) observer.observe(marker);
    const update = () => { setPageEnd(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 100); scrollingDown = window.scrollY > previous; previous = window.scrollY; };
    update(); window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => { observer.disconnect(); window.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [aside]);
  const share = async () => {
    const url = new URL(path, location.origin).href;
    if (typeof navigator.share === 'function') {
      try { await navigator.share({ title, text, url }); return; }
      catch (error) { if (error instanceof DOMException && error.name === 'AbortError') return; }
    }
    presentModal('分享此内容', <ShareModal url={url} title={title} />, { clickOutsideToDismiss: true });
  };
  const button = <MotionButtonBase aria-label={note ? '分享这条手记' : '分享这篇文章'} className="flex flex-col space-y-2" onClick={share}>
    <i className="text-[24px] opacity-80 duration-200 hover:opacity-100 relative i-mingcute-share-forward-line hover:text-info" />
  </MotionButtonBase>;
  if (!aside) return <div data-hide-print data-pagefind-ignore className={`${note ? 'mb-8 mt-4 xl:hidden' : 'my-6 lg:hidden'} flex items-center justify-center space-x-8`}>{button}</div>;
  return <div data-hide-print data-pagefind-ignore className={`absolute bottom-0 left-0 -mb-4 flex max-h-[300px] p-4 transition-all duration-200 ease-in-out translate-y-[calc(100%+24px)] ${eof ? '' : 'opacity-20 hover:opacity-100'}`}>
    <div className={`flex origin-top-left flex-col gap-6 duration-200 ease-in-out [&>button]:duration-200 ${pageEnd ? '-rotate-90 [&>button]:!rotate-90' : ''}`}>{button}</div>
  </div>;
}
