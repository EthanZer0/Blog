import { presentModal,dismissAll } from './ModalRoot';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { MarkdownHeading } from 'astro';
import TocTree from './TocTree';

// TocFAB uses PresentSheet on mobile, as in the original modal stack.
export default function TocDialog({ headings }: { headings: MarkdownHeading[] }) {
  const [hidden,setHidden] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => { let previous = window.scrollY; const update = () => { setHidden(window.scrollY > previous); previous=window.scrollY; }; window.addEventListener('scroll',update,{passive:true}); return () => window.removeEventListener('scroll',update); },[]);
  return <>
    <div className={`toc-fab fixed bottom-[calc(2rem+env(safe-area-inset-bottom))] left-[calc(100vw-3rem-1rem)] z-[9] flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${hidden ? 'translate-x-[calc(100%+2rem)]' : ''}`} data-pagefind-ignore>
      <motion.button onClick={()=>presentModal("文章目录",<TocTree headings={headings} onItemClick={dismissAll} scrollInNextTick/>)} initial={reduced ? false : {scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:.2,ease:'easeInOut'}} aria-label="文章目录" className="center mt-2 flex size-12 rounded-xl border border-zinc-400/20 bg-zinc-50/80 text-lg shadow-lg backdrop-blur-lg outline-accent hover:opacity-100 focus:opacity-100 focus:outline-hidden md:size-10 md:text-base dark:border-zinc-500/30 dark:bg-neutral-900/80 dark:text-zinc-200"><i className="i-mingcute-list-expansion-line" /></motion.button>
    </div>
  </>;
}
