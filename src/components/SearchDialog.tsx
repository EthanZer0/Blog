import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useId, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { microDampingPreset } from './upstream/spring';
import { EmptyIcon } from './upstream/empty';
import { withBase } from '../lib/url';
type Result = { id: string; title: string; subtitle?:string; url: string };
type Pagefind = { search(query: string): Promise<{ results: { id: string; data(): Promise<{ meta: { title?: string; subtitle?: string }; url: string }> }[] }> };
let index: Promise<Pagefind> | undefined;

// Search presentation uses Shiro spring/easing with a local Pagefind adapter.
export default function SearchDialog() {
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null), inputRef = useRef<HTMLInputElement>(null);
  const resultsId = useId();
  const opening = { type: 'tween' as const, duration: reduced ? 0 : .18, ease: [.22, 1, .36, 1] as [number, number, number, number] };
  const closing = { type: 'tween' as const, duration: reduced ? 0 : .16, ease: [.32, .72, 0, 1] as [number, number, number, number] };
  const [open, setOpen] = useState(false), [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Result[]>([]), [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false), [error, setError] = useState(false);
  const composing = useRef(false), listRef=useRef<HTMLUListElement>(null);
  const [portalKey, setPortalKey] = useState(0);
  useEffect(() => {
    if (!open) return;
    // Keyboards may resize only the visual viewport on mobile browsers.
    const viewport = window.visualViewport;
    const update = () => {
      panelRef.current?.style.setProperty('--search-viewport-height', (viewport?.height ?? innerHeight) + 'px');
      panelRef.current?.style.setProperty('--search-viewport-top', (viewport?.offsetTop ?? 0) + 'px');
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [open]);
  useEffect(()=>{listRef.current?.children[selected]?.scrollIntoView({block:"nearest",behavior:reduced ? "instant" : "smooth"});},[selected,reduced]);
  useEffect(()=>{const close=()=>flushSync(()=>{setOpen(false);setKeyword("");setPortalKey(key=>key+1);});document.addEventListener("astro:before-swap",close);return()=>document.removeEventListener("astro:before-swap",close);},[]);
  useEffect(() => {
    const hotkey = (event: KeyboardEvent) => { if (event.key === 'k' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); setOpen(true); } };
    document.addEventListener('keydown',hotkey); return () => document.removeEventListener('keydown',hotkey);
  }, []);
  useEffect(() => {
    let cancelled = false;
    if (!open) { setLoading(false); return; }
    if (!keyword.trim()) { setResults([]); setLoading(false); setError(false); return; }
    setLoading(true); setError(false);
    const timer = setTimeout(async () => {
      try {
        index ||= import(/* @vite-ignore */ withBase('/pagefind/pagefind.js')) as Promise<Pagefind>;
        const found = await (await index).search(keyword);
        const rows = await Promise.all(found.results.slice(0,30).map(async hit => { const data = await hit.data(); return {id:hit.id,title:data.meta.title || data.url,subtitle:data.meta.subtitle,url:data.url}; }));
        if (!cancelled) { setResults(rows); setSelected(0); setLoading(false); }
      } catch { if (!cancelled) { index = undefined; setError(true); setLoading(false); } }
    },360);
    return () => { cancelled = true; clearTimeout(timer); };
  },[keyword,open]);
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger asChild>
      <motion.button aria-label="搜索文章" whileHover={reduced ? undefined : {scale:1.04}} whileTap={reduced ? undefined : {scale:.94}} transition={microDampingPreset} className="navigation-button group center flex size-10 rounded-full text-lg transition-colors hover:text-accent data-[state=open]:text-accent">
        <i className="i-mingcute-search-line" />
      </motion.button>
    </Dialog.Trigger>
    <Dialog.Portal key={portalKey} forceMount>
      <AnimatePresence>{open && <>
        <Dialog.Overlay forceMount asChild>
          <motion.div initial={reduced ? false : {opacity:0}} animate={{opacity:1}} exit={{opacity:0,transition:closing}} transition={opening} className="site-search-backdrop fixed inset-0 z-[19]" />
        </Dialog.Overlay>
        <Dialog.Content forceMount asChild aria-describedby={undefined} onEscapeKeyDown={event => { if (composing.current) event.preventDefault(); }}>
          <motion.div ref={panelRef} initial={reduced ? false : {opacity:0,y:8,scale:.985}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:8,scale:.985,transition:closing}} transition={opening} className="site-search-panel z-20 flex flex-col overflow-hidden pb-9">
            <Dialog.Title className="sr-only">搜索</Dialog.Title>
            <div className="flex shrink-0 items-center px-5 py-1.5">
              <input ref={inputRef} aria-label="搜索文稿与手记" aria-controls={resultsId} autoFocus autoComplete="off" spellCheck={false} enterKeyHint="search" className="min-w-0 flex-1 border-0 bg-transparent py-2.5 text-base outline-none! placeholder:text-neutral-8/50" placeholder="搜索..." value={keyword} onChange={event => setKeyword(event.target.value)} onCompositionStart={() => {composing.current=true;}} onCompositionEnd={() => {composing.current=false;}} onKeyDown={event => {
                if (composing.current || event.nativeEvent.isComposing || !results.length) return;
                if (event.key==='ArrowDown' || event.key==='ArrowUp') {event.preventDefault();setSelected(value => (value+(event.key==='ArrowDown'?1:-1)+results.length)%results.length);}
                if (event.key==='Enter') {event.preventDefault();(listRef.current?.children[selected]?.querySelector("a") as HTMLAnchorElement)?.click();}
              }} />
              {keyword && <button aria-label="清除搜索" className="center -mr-2 flex size-11 shrink-0 rounded-lg text-neutral-8/60 transition-colors hover:text-accent" onClick={() => {setKeyword('');inputRef.current?.focus();}}><i className="i-mingcute-close-circle-line" /></button>}
            </div>
            <div className="site-search-divider mx-5 h-px shrink-0" aria-hidden="true" />
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" aria-busy={loading}>
              <ul id={resultsId} ref={listRef} className={loading || !results.length ? 'center flex h-full p-6' : 'space-y-1 p-2'}>
                {loading ? <li role="status" className="center flex gap-2 text-sm text-neutral-8"><span className="loading loading-spinner loading-sm" />搜索中…</li> : results.length ? results.map((result,i) => <li key={result.id} onMouseOver={() => setSelected(i)}>
                  <a href={result.url} className={'block rounded-xl px-3 py-3 transition-colors hover:bg-accent/8 ' + (selected===i?'bg-accent/8':'')}>
                    <span className="line-clamp-2 block text-[15px] font-medium leading-6">{result.title}</span>
                    {result.subtitle && <span className="mt-1 line-clamp-2 block text-xs leading-5 text-neutral-8">{result.subtitle}</span>}
                  </a>
                </li>) : <li className="flex flex-col items-center gap-3 text-center text-neutral-8">
                  {keyword ? <EmptyIcon /> : <i className="i-mingcute-search-line text-4xl opacity-40" />}
                  <span role="status" className="font-serif text-sm italic text-neutral-8/55">{error?'搜索索引加载失败，请重试。':keyword?'没有找到相关内容':'寻找一篇文稿，或一段手记。'}</span>
                </li>}
              </ul>
            </div>
            <a href="https://pagefind.app/" target="_blank" rel="noopener noreferrer" className="absolute bottom-3 right-5 text-[10px] text-neutral-8 opacity-45 transition-opacity hover:opacity-80">Search by Pagefind</a>
          </motion.div>
        </Dialog.Content>
      </>}</AnimatePresence>
    </Dialog.Portal>
  </Dialog.Root>;
}
