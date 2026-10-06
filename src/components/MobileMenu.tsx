import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Drawer } from 'vaul';
import { siteConfig } from '../site.config';
import { withBase } from '../lib/url';
import { reboundPreset } from './upstream/spring';
import { FaSolidDotCircle, IcTwotoneSignpost, FaSolidFeatherAlt, FaSolidHistory } from './upstream/menu-collection';

const icons = [FaSolidDotCircle, IcTwotoneSignpost, FaSolidFeatherAlt, FaSolidHistory];
// HeaderDrawerButton + HeaderDrawerContent + PresentSheet, with static menu data.
export default function MobileMenu() {
  const [open, setOpen] = useState(false), [opacity, setOpacity] = useState(1);
  const reduced = useReducedMotion();
  useEffect(() => {
    const update = () => setOpacity(1 - Math.floor(Math.max(0, Math.min(1, (window.scrollY - 197) / 50)) * 100) / 100);
    window.addEventListener('scroll', update, { passive: true }); update();
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <Drawer.Root open={open} onOpenChange={setOpen}>
    <Drawer.Trigger asChild><button aria-label="展开导航" style={{ opacity, visibility: opacity === 0 ? 'hidden' : 'visible' }} className="group center relative flex size-10 rounded-full bg-base-100 px-3 text-sm ring-1 ring-zinc-900/5 transition dark:ring-white/10 dark:hover:ring-white/20"><i className="i-mingcute-menu-line" /></button></Drawer.Trigger>
    <Drawer.Portal>
      <Drawer.Overlay className="fixed inset-0 z-[999] bg-neutral-800/40" />
      <Drawer.Content aria-describedby={undefined} className="fixed inset-x-0 bottom-0 z-[1000] flex max-h-[calc(100svh-5rem)] flex-col rounded-t-[10px] bg-base-100 p-4">
        <div className="mx-auto mb-8 h-1.5 w-12 shrink-0 rounded-full bg-zinc-300 dark:bg-neutral-800" />
        <Drawer.Title className="sr-only">导航</Drawer.Title>
        <nav aria-label="手机导航" className="scrollbar-none mt-12 max-h-[80dvh] w-[90vw] space-y-4 overflow-auto pb-24">
          {siteConfig.nav.map((item, index) => {
            const Icon = icons[index];
            return <motion.section key={item.path} initial={reduced ? false : { y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...reboundPreset, delay: index * .08 }}>
              <a className="block" href={withBase(item.path)} onClick={() => setOpen(false)}><span className="flex items-center space-x-2 py-2 text-lg"><i>{Icon ? <Icon /> : <i className={item.icon} />}</i><h2>{item.title}</h2></span></a>
            {item.subMenu && <ul className="my-2 grid grid-cols-2 gap-2">{item.subMenu.map(sub=><li key={sub.path}><a className="inline-block p-2" href={withBase(sub.path)} onClick={()=>setOpen(false)}>{sub.title}</a></li>)}</ul>}
            </motion.section>;
          })}
        </nav>
      </Drawer.Content>
    </Drawer.Portal>
  </Drawer.Root>;
}
