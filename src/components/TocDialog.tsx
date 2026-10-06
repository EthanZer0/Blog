import { Drawer } from 'vaul';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { MarkdownHeading } from 'astro';

// TocFAB uses PresentSheet on mobile, as in the original modal stack.
export default function TocDialog({ headings }: { headings: MarkdownHeading[] }) {
  const [open, setOpen] = useState(false), [hidden,setHidden] = useState(false);
  const reduced = useReducedMotion();
  const depth = Math.min(...headings.map(heading => heading.depth));
  useEffect(() => { let previous = window.scrollY; const update = () => { setHidden(window.scrollY > previous); previous=window.scrollY; }; window.addEventListener('scroll',update,{passive:true}); return () => window.removeEventListener('scroll',update); },[]);
  return <Drawer.Root open={open} onOpenChange={setOpen}>
    <div className={`toc-fab fixed bottom-[calc(2rem+env(safe-area-inset-bottom))] left-[calc(100vw-3rem-1rem)] z-[9] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${hidden ? 'translate-x-[calc(100%+2rem)]' : ''}`} data-pagefind-ignore>
      <Drawer.Trigger asChild><motion.button initial={reduced ? false : {scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:.2,ease:'easeInOut'}} aria-label="文章目录" className="center mt-2 flex size-12 rounded-xl border border-zinc-400/20 bg-zinc-50/80 text-lg shadow-lg backdrop-blur-lg outline-accent hover:opacity-100 focus:opacity-100 focus:outline-hidden md:size-10 md:text-base dark:border-zinc-500/30 dark:bg-neutral-900/80 dark:text-zinc-200"><i className="i-mingcute-list-expansion-line" /></motion.button></Drawer.Trigger>
    </div>
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-[999] bg-neutral-800/40" />
      <Drawer.Content aria-describedby={undefined} className="fixed inset-x-0 bottom-0 z-[1000] flex max-h-[calc(100svh-5rem)] flex-col rounded-t-[10px] bg-base-100 p-4">
        <div className="mx-auto mb-8 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300 dark:bg-neutral-800" />
        <Drawer.Title className="-mt-4 mb-4 flex justify-center text-lg font-medium">文章目录</Drawer.Title>
        <nav aria-label="文章目录" className="min-h-0 overflow-auto"><ul className="max-h-full space-y-3 overflow-y-auto [&>li]:py-1">{headings.map(heading => <li key={heading.slug}><a className="relative mb-[1.5px] inline-block min-w-0 max-w-full truncate text-left leading-normal text-neutral tabular-nums opacity-50 transition-all duration-500 hover:opacity-80" style={{paddingLeft:`${(heading.depth-depth)*.6+.5}rem`}} href={`#${heading.slug}`} onClick={() => setOpen(false)}>{heading.text}</a></li>)}</ul></nav>
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>;
}
