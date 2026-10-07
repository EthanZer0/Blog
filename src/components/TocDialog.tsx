import { presentModal,dismissAll } from './ModalRoot';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';
import type { MarkdownHeading } from 'astro';
import TocTree from './TocTree';
import NoteFontSettings from './NoteFontSettings';
import type { HTMLMotionProps } from 'motion/react';

// FABBase appearance and entrance parameters from the original FABContainer.
function ReadingButton({ className = '', ...props }: HTMLMotionProps<'button'>) {
  const reduced = useReducedMotion();
  return <motion.button initial={reduced ? false : {scale:0,opacity:0}} animate={{scale:1,opacity:1}} transition={{duration:.2,ease:'easeInOut'}}
    className={`mt-2 flex items-center justify-center size-12 text-lg md:size-10 md:text-base outline-accent hover:opacity-100 focus:opacity-100 focus:outline-hidden rounded-xl border border-zinc-400/20 backdrop-blur-lg dark:border-zinc-500/30 dark:text-zinc-200 bg-zinc-50/80 shadow-lg dark:bg-neutral-900/80 ${className}`} {...props} />;
}

// TocFAB uses PresentSheet on mobile, as in the original modal stack.
export default function TocDialog({ headings, note = false }: { headings: MarkdownHeading[]; note?: boolean }) {
  const [hidden,setHidden] = useState(false);
  useEffect(() => { let previous = window.scrollY; const update = () => { setHidden(matchMedia('(max-width:1024px)').matches && window.scrollY > previous); previous=window.scrollY; }; window.addEventListener('scroll',update,{passive:true}); return () => window.removeEventListener('scroll',update); },[]);
  return <>
    <div className={`toc-fab fixed bottom-[calc(2rem+env(safe-area-inset-bottom))] left-[calc(100vw-3rem-1rem)] z-[9] flex flex-col transition-transform duration-300 ease-in-out ${note ? '' : 'lg:hidden'} ${hidden ? 'translate-x-[calc(100%+2rem)]' : ''}`} data-pagefind-ignore data-hide-print>
      {note && <NoteFontSettings triggerElement={<ReadingButton aria-label="手记字形设置"><i className="i-mingcute-font-line" /></ReadingButton>} />}
      {headings.length > 0 && <ReadingButton className={note ? 'xl:hidden' : ''} onClick={()=>presentModal("文章目录",<TocTree headings={headings} onItemClick={dismissAll} scrollInNextTick/>)} aria-label="文章目录"><i className="i-mingcute-list-expansion-line" /></ReadingButton>}
    </div>
  </>;
}
