// Shiro HeaderContent: original spotlight, scroll thresholds and Motion transitions.
import { useEffect, useState } from 'react';
import { AnimatePresence, LayoutGroup, motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'motion/react';
import type { NavItem } from '../site.config';
import MenuPopover from './MenuPopover';
import { withBase } from '../lib/url';
import { FaSolidDotCircle, IcTwotoneSignpost, FaSolidFeatherAlt, FaSolidHistory } from './upstream/menu-collection';

const icons = [FaSolidDotCircle, IcTwotoneSignpost, FaSolidFeatherAlt, FaSolidHistory];
function Capsule({ pathname, label, nav }: { pathname: string; label: string; nav: NavItem[] }) {
  const mouseX = useMotionValue(0), mouseY = useMotionValue(0), radius = useMotionValue(0);
  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${mouseX}px ${mouseY}px, var(--spotlight-color) 0%, transparent 65%)`;
  return <nav aria-label={label} onPointerMove={event => {
    const bounds = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - bounds.left); mouseY.set(event.clientY - bounds.top);
    radius.set(Math.hypot(bounds.width, bounds.height) / 2.5);
  }} className="group pointer-events-auto relative rounded-full bg-gradient-to-b from-zinc-50/70 to-white/90 shadow-lg shadow-zinc-800/5 ring-1 ring-zinc-900/5 backdrop-blur-md duration-200 [--spotlight-color:oklch(from_var(--color-accent)_l_c_h_/_0.12)] dark:from-zinc-900/70 dark:to-zinc-800/90 dark:ring-zinc-100/10">
    <motion.div aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background }} />
    <div className="flex px-4 font-medium text-zinc-800 dark:text-zinc-200">
      {nav.map((item, index) => {
        const href=withBase(item.path),sub=item.subMenu?.find(sub=>pathname===withBase(sub.path)||(sub.path.includes('/series/')&&pathname.startsWith(withBase(sub.path)))),active=Boolean(sub)||pathname.split('?')[0]===href||(item.path!=='/'&&pathname.startsWith(href));
        const Icon = icons[index];
        return <MenuPopover key={href} subMenu={item.subMenu}><div><a href={href} aria-current={active ? 'page' : undefined} className={`relative block whitespace-nowrap px-4 py-2 transition duration-200 ${active ? 'text-accent' : 'hover:text-accent/80'}`}>
          <span className="relative flex items-center">{active && <motion.span layoutId="header-menu-icon" className="mr-2 flex items-center">{Icon ? <Icon aria-hidden="true" /> : <i className={item.icon} aria-hidden="true" />}</motion.span>}<motion.span layout>{sub?.title||item.title}</motion.span></span>
          {active && <motion.span layoutId="active-nav-item" className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-accent/0 via-accent/70 to-accent/0" />}
        </a></div></MenuPopover>;
      })}
    </div>
  </nav>;
}

export default function DesktopNav({ pathname: initialPathname, nav }: { pathname: string; nav: NavItem[] }) {
  const [pathname,setPathname]=useState(initialPathname);
  const [opacity, setOpacity] = useState(1), [floating, setFloating] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    let lastY = window.scrollY, timer: ReturnType<typeof setTimeout> | undefined, frame = 0;
    const update = () => {
      const y = window.scrollY;
      // Header hooks.ts: threshold 84 + 63 + 50, fade distance 50.
      setOpacity(document.querySelector('[data-header-hide-bg]') ? 1 : 1 - Math.floor(Math.max(0, Math.min(1, (y - 197) / 50)) * 100) / 100);
      const show = y > 600 && y < lastY;
      clearTimeout(timer); timer = setTimeout(() => setFloating(show), 120);
      lastY = y; frame = 0;
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    const navigate=()=>{setPathname(location.pathname+location.search);setFloating(false);lastY=scrollY;update();};
    update(); window.addEventListener('scroll', schedule, { passive: true });document.addEventListener('astro:page-load',navigate);
    return () => { window.removeEventListener('scroll', schedule);document.removeEventListener('astro:page-load',navigate); cancelAnimationFrame(frame); clearTimeout(timer); };
  }, []);
  return <>
    <LayoutGroup id="header-main"><div className="duration-100" style={{ opacity, visibility: opacity === 0 ? 'hidden' : 'visible' }}><Capsule pathname={pathname} label="主导航" nav={nav} /></div></LayoutGroup>
    <AnimatePresence>{floating && <motion.div initial={reduced ? false : { y: -20 }} animate={{ y: 0 }} exit={{ y: -20, opacity: 0 }} className="pointer-events-none fixed inset-x-0 top-4 z-10 flex justify-center"><LayoutGroup id="header-floating"><Capsule pathname={pathname} label="浮动导航" nav={nav} /></LayoutGroup></motion.div>}</AnimatePresence>
  </>;
}
