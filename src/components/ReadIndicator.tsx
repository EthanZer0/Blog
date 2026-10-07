// Original ReadIndicator geometry, Progress SVGs and 200ms icon fade.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CircleProgress, MaterialSymbolsProgressActivity } from './upstream/Progress';
export default function ReadIndicator() {
  const [percent, setPercent] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const update = () => setPercent(Number(document.querySelector('[data-article-body]')?.getAttribute('data-read-percent')) || 0);
    update(); document.addEventListener('shiro:reading-progress', update);
    return () => document.removeEventListener('shiro:reading-progress', update);
  }, []);
  return <span className="text-zinc-800 dark:text-neutral-300" data-reading-indicator>
    <div className="flex items-center gap-2" role="progressbar" aria-label="阅读进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}>
      <AnimatePresence mode="wait" initial={false}><motion.span key={percent === 0 ? 'solid' : 'regular'} initial={{ opacity: .001 }} animate={{ opacity: 1 }} exit={{ opacity: .001 }} transition={{ duration: reduced ? 0 : .2 }}>
        {percent === 0 ? <MaterialSymbolsProgressActivity /> : <CircleProgress percent={percent} size={14} strokeWidth={2} />}
      </motion.span></AnimatePresence>
      {percent}%<br />
    </div>
    <a href="#main" data-back-to-top className={`mt-1 flex flex-nowrap items-center gap-2 transition-all duration-500 hover:opacity-100 ${percent > 10 ? 'opacity-50' : 'pointer-events-none opacity-0'}`} tabIndex={percent > 10 ? 0 : -1}>
      <i className="i-mingcute-arrow-up-circle-line" /><span className="whitespace-nowrap">回到顶部</span>
    </a>
  </span>;
}
