// TocTree / TocItem: original observation margin, item entrance, active marker and centering.
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useRef, useState } from 'react';
import type { MarkdownHeading } from 'astro';
import { throttle } from 'lodash-es';
import { microReboundPreset } from './upstream/spring';
import { springScrollToElement } from '../lib/scroller';
let activeId:string|null=null;
const listeners=new Set<(id:string|null)=>void>();
function setActive(id:string){activeId=id;listeners.forEach(listener=>listener(id));}
export default function TocTree({headings,onItemClick,scrollInNextTick=false}: {headings:MarkdownHeading[];onItemClick?:()=>void;scrollInNextTick?:boolean}) {
  const [active,set]=useState<string|null>(null),[canScroll,setCanScroll]=useState(false);
  const outer=useRef<HTMLUListElement>(null),tree=useRef<HTMLUListElement>(null),id=useId(),reduced=useReducedMotion();
  useEffect(() => { const resize = throttle(() => { if (outer.current) outer.current.style.maxWidth = `${innerWidth - outer.current.getBoundingClientRect().x - 30}px`; }, 14); resize(); window.addEventListener('resize', resize); return () => { window.removeEventListener('resize', resize); resize.cancel(); }; }, []);
  const rootDepth=Math.min(...headings.map(h=>h.depth));
  useEffect(()=>{set(activeId);listeners.add(set);const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)setActive(entry.target.id);}),{rootMargin:'-100px 0px -100px 0px'});headings.forEach(h=>{const el=document.getElementById(h.slug);if(el)observer.observe(el);});const resize=new ResizeObserver(()=>setCanScroll(!!tree.current&&tree.current.scrollHeight>tree.current.clientHeight));if(tree.current)resize.observe(tree.current);return()=>{listeners.delete(set);if(!listeners.size)activeId=null;observer.disconnect();resize.disconnect();};},[headings]);
  useEffect(()=>{const item=tree.current?.querySelector<HTMLElement>('[data-active="true"]'),container=tree.current;if(!item||!container)return;const top=item.offsetTop-container.scrollTop,bottom=top+item.clientHeight;if(top<0||bottom>container.clientHeight)container.scrollTop=item.offsetTop-container.clientHeight/2+item.clientHeight/2;},[active]);
  return <LayoutGroup id={id}><ul ref={outer} className="scrollbar-none flex grow flex-col scroll-smooth px-2 min-h-0"><ul ref={tree} className={`scrollbar-none overflow-auto ${canScroll?'mask-scroller':''}`}>
    {headings.map((heading,index)=><motion.li key={heading.slug} data-active={heading.slug===active} initial={reduced?false:{x:42,opacity:.001}} animate={{x:0,opacity:1,transition:reduced?{duration:0}:{duration:.5,...microReboundPreset,delay:.05*index}}} exit={{x:reduced?0:42,opacity:.001,transition:{duration:reduced?0:.5,delay:reduced?0:.05}}} className="relative leading-none">
      {heading.slug===active&&<motion.span layoutId="active-toc-item" layout className="absolute inset-y-[3px] left-0 w-[2px] rounded-xs bg-accent"/>}
      <a data-index={index} data-depth={heading.depth} aria-current={heading.slug===active?'location':undefined} title={heading.text} href={`#${heading.slug}`} className={`relative mb-[1.5px] inline-block min-w-0 max-w-full leading-normal text-neutral-8 truncate text-left tabular-nums transition-all duration-500 hover:opacity-80 ${heading.slug===active?'ml-2 opacity-100':'opacity-50'}`} style={{paddingLeft:`${(heading.depth-rootDepth)*.6+.5}rem`}} onClick={event=>{event.preventDefault();event.stopPropagation();onItemClick?.();const handle=()=>{const el=document.getElementById(heading.slug);if(el){history.replaceState(history.state,'',`#${heading.slug}`);springScrollToElement(el).then(()=>{if(el.isConnected)setActive(heading.slug);});}};if(scrollInNextTick)requestAnimationFrame(handle);else handle();}}><span className="cursor-pointer">{heading.text}</span></a>
    </motion.li>)}
  </ul></ul></LayoutGroup>;
}
