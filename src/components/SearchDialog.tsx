import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { microDampingPreset } from './upstream/spring';
import { EmptyIcon } from './upstream/empty';
import { withBase } from '../lib/url';
type Result = { id: string; title: string; url: string };
type Pagefind = { search(query: string): Promise<{ results: { id: string; data(): Promise<{ meta: { title?: string }; url: string }> }[] }> };
let index: Promise<Pagefind> | undefined;

// SearchFAB.tsx panel and result rows, with a local Pagefind query adapter.
export default function SearchDialog() {
  const [open, setOpen] = useState(false), [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Result[]>([]), [selected, setSelected] = useState(0);
  const [loading, setLoading] = useState(false), [error, setError] = useState(false);
  const composing = useRef(false);
  useEffect(() => {
    const hotkey = (event: KeyboardEvent) => { if (event.key === 'k' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); setOpen(true); } };
    document.addEventListener('keydown',hotkey); return () => document.removeEventListener('keydown',hotkey);
  }, []);
  useEffect(() => {
    let cancelled = false;
    if (!keyword.trim()) { setResults([]); setLoading(false); setError(false); return; }
    setLoading(true); setError(false);
    const timer = setTimeout(async () => {
      try {
        index ||= import(/* @vite-ignore */ withBase('/pagefind/pagefind.js')) as Promise<Pagefind>;
        const found = await (await index).search(keyword);
        const rows = await Promise.all(found.results.slice(0,30).map(async hit => { const data = await hit.data(); return {id:hit.id,title:data.meta.title || data.url,url:data.url}; }));
        if (!cancelled) { setResults(rows); setSelected(0); setLoading(false); }
      } catch { if (!cancelled) { index = undefined; setError(true); setLoading(false); } }
    },200);
    return () => { cancelled = true; clearTimeout(timer); };
  },[keyword]);
  return <Dialog.Root open={open} onOpenChange={setOpen}>
    <Dialog.Trigger asChild><button aria-label="搜索文章" className="group center flex size-10 rounded-full bg-base-100 px-3 text-sm ring-1 ring-zinc-900/5 transition dark:ring-white/10 dark:hover:ring-white/20"><i className="i-mingcute-search-line" /></button></Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[19]" />
      <Dialog.Content asChild aria-describedby={undefined} onEscapeKeyDown={event => { if (composing.current) event.preventDefault(); }}>
        <motion.div animate={{y:0}} transition={microDampingPreset} className="fixed top-1/2 left-1/2 z-20 flex h-[600px] max-h-[80vh] min-h-[50px] w-[800px] max-w-screen -translate-x-1/2 -translate-y-1/2 flex-col rounded-none border-0 border-zinc-200 bg-zinc-50/80 shadow-2xl backdrop-blur-md md:h-screen md:max-h-[60vh] md:max-w-[80vw] md:rounded-xl md:border dark:border-zinc-800 dark:bg-neutral-900/80">
          <Dialog.Title className="sr-only">搜索</Dialog.Title>
          <input aria-label="搜索文稿与手记" autoFocus className="w-full shrink-0 border-b border-zinc-200 bg-transparent p-4 px-5 text-lg leading-4 dark:border-neutral-700" placeholder="搜索文稿与手记…" value={keyword} onChange={event => setKeyword(event.target.value)} onCompositionStart={() => {composing.current=true;}} onCompositionEnd={() => {composing.current=false;}} onKeyDown={event => {
            if (composing.current || event.nativeEvent.isComposing || !results.length) return;
            if (event.key==='ArrowDown' || event.key==='ArrowUp') {event.preventDefault();setSelected(value => (value+(event.key==='ArrowDown'?1:-1)+results.length)%results.length);}
            if (event.key==='Enter') {event.preventDefault();location.href=results[selected].url;}
          }} />
          <div className="relative h-0 shrink grow overflow-auto"><ul className="h-full px-2 py-4">
            {loading ? <li className="center flex h-full"><span className="loading loading-spinner" /></li> : results.length ? results.map((result,i) => <li key={result.id} onMouseOver={() => setSelected(i)} className={`relative flex w-full justify-between px-1 before:absolute before:inset-0 before:z-0 before:rounded-md before:content-[''] hover:before:bg-zinc-200/80 dark:hover:before:bg-zinc-800/80 ${selected===i?'before:bg-zinc-200/80 dark:before:bg-zinc-800/80':''}`}><a href={result.url} className="relative z-10 flex w-full justify-between p-3"><span className="block min-w-0 flex-1 shrink-0 truncate">{result.title}</span></a></li>) : <li className="center flex h-full"><div className="flex flex-col items-center space-y-2">{keyword ? <EmptyIcon /> : <i className="i-mingcute-search-line text-[60px]" />}<span role="status">{error?'搜索索引加载失败，请重试。':keyword?'没有找到相关内容':''}</span></div></li>}
          </ul></div>
          <div className="flex shrink-0 items-center justify-between px-4 py-2 text-sm"><span>↑ ↓ 选择 · Enter 打开 · Esc 关闭</span><a href={withBase('/search/')} className="opacity-50">Pagefind</a></div>
        </motion.div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
