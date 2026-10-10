import { animateValue, animate } from 'motion';
import { Spring,softBouncePreset } from '../components/upstream/spring';
import { throttle } from 'lodash-es';
import { recentDateLabel } from '../lib/recent-date';
import { mountListReveal } from './list-reveal';
let dispose:(()=>void)|undefined;
function initializePage(){
 dispose?.();const controller=new AbortController(),signal=controller.signal,cleanups:Array<()=>void>=[];
 dispose=()=>{controller.abort();cleanups.forEach(cleanup=>cleanup());};

// Port MagneticHoverEffect's bounds, 0.05 attraction and exact easing.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches){
 document.querySelectorAll<HTMLElement>('[data-home-animation]').forEach(element=>{element.style.opacity='.0001';element.style.transform='translateY(50px)';const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){const control=animate(element,{opacity:1,y:0},element.dataset.homeAnimation==='posts'?Spring.presets.snappy:softBouncePreset);cleanups.push(()=>control.stop());observer.disconnect();}},{threshold:0});observer.observe(element);cleanups.push(()=>observer.disconnect());});
}
document.querySelectorAll<HTMLElement>('.post-item').forEach(item => {
  item.addEventListener('pointerenter', event => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    const rect = item.getBoundingClientRect();
    item.style.transition = 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)';
    item.style.setProperty('--origin-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
    item.style.setProperty('--origin-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
  }, { signal });
  item.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    const rect = item.getBoundingClientRect();
    item.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .05}px, ${(event.clientY - rect.top - rect.height / 2) * .05}px)`;
  }, { signal });
  item.addEventListener('pointerleave', () => {
    item.style.transform = 'translate(0px, 0px)';
    item.style.transition = 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
  }, { signal });
});

const headerLogo = document.querySelector<HTMLElement>('.header-logo');
const headerKeepsLogo = !!document.querySelector('[data-header-hide-bg]');
const desktop = matchMedia('(min-width:1024px)');
let headerFrame = 0;
function updateHeaderLogo() {
  if (headerLogo) headerLogo.style.opacity = String(headerKeepsLogo && desktop.matches ? 1 : 1 - Math.floor(Math.max(0, Math.min(1, (window.scrollY - 197) / 50)) * 100) / 100);
  headerFrame = 0;
}
window.addEventListener('scroll', () => { if (!headerFrame) headerFrame = requestAnimationFrame(updateHeaderLogo); }, { passive: true, signal });
updateHeaderLogo();

const article = document.querySelector<HTMLElement>('[data-article-body]');
if (article) {
  // Original immersive-reading provider: focus pages, 300ms mouse bounds check,
  // TocAside's opacity/pointer behavior and smooth spring. Notes stay unchanged.
  if (article.hasAttribute('data-focus-reading')) {
    const toc = document.querySelector<HTMLElement>('[data-toc]');
    if (toc) {
      let inside = false;
      let fading: ReturnType<typeof animate> | undefined;
      const move = throttle((event: MouseEvent) => {
        const rect = article.getBoundingClientRect();
        const next = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (inside === next) return;
        inside = next;
        fading?.stop();
        toc.style.pointerEvents = inside ? 'none' : 'auto';
        fading = animate(toc, { opacity: inside ? .2 : 1 }, reducedMotion.matches ? { duration: 0 } : Spring.presets.smooth);
      }, 300);
      document.addEventListener('mousemove', move, { passive: true, signal });
      cleanups.push(() => { move.cancel(); fading?.stop(); });
    }
  }
  const hasEnhancements = article.querySelector('video[data-video-player], a.shiro-link--underline, [data-tabs], [data-masonry], [data-grid-images], [data-link-card], [data-markdown-tag], [data-shiro-code], [data-gallery], figure img');
  if (hasEnhancements) import('../components/ArticleEnhancements').then(({mountArticleEnhancements})=>{if(!signal.aborted)cleanups.push(mountArticleEnhancements(article));});
  let scheduled = 0, endVisible = false, lastScroll = window.scrollY, scrollingDown = false, lastPercent = -1;
  const region = document.querySelector<HTMLElement>('[data-reading-region]') || article;
  const vertical = document.querySelector<HTMLElement>('[data-progress-vertical]');
  const rail = document.querySelector<HTMLElement>('[data-reading-vertical]');
  const indicator = document.querySelector<HTMLElement>('[data-reading-indicator]');
  function updateReading() {
    scrollingDown = window.scrollY > lastScroll; lastScroll = window.scrollY;
    const top = region.getBoundingClientRect().top + window.scrollY;
    const percent = Math.floor(Math.max(0, Math.min(100, (window.scrollY - top + Math.min(window.scrollY, window.innerHeight)) / Math.max(1,region.offsetHeight) * 100)));
    const rect = indicator?.getBoundingClientRect();
    const indicatorVisible = !!indicator?.getClientRects().length && !!rect && rect.bottom > 0 && rect.top < innerHeight;
    if (rail) { rail.hidden = indicatorVisible; rail.style.opacity = endVisible ? '0' : '1'; }
    if (percent !== lastPercent) {
      lastPercent = percent;
      if (vertical) vertical.style.height = `${percent}%`;
      article!.dataset.readPercent = String(percent);
      document.dispatchEvent(new Event('shiro:reading-progress'));
    }
    scheduled = 0;
  }
  const schedule = () => { if (!scheduled) { scheduled = requestAnimationFrame(updateReading); } };
  const resize = new ResizeObserver(schedule); resize.observe(article);
  const endMarker = document.querySelector('[data-article-end]');
  const endObserver = new IntersectionObserver(([entry]) => { if (entry.isIntersecting || !scrollingDown) { endVisible = entry.isIntersecting; schedule(); } });
  if (endMarker) endObserver.observe(endMarker);
  cleanups.push(() => { resize.disconnect(); endObserver.disconnect(); cancelAnimationFrame(scheduled); });
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { passive: true, signal });
  window.addEventListener('load', schedule, { once: true, signal });
  updateReading();
}

// Original scroller spring; cancel cleanly when the reader takes control.
let scrolling: ReturnType<typeof animateValue> | undefined;
let clearScrollingListeners: (() => void) | undefined;
document.addEventListener('click', event => {
  const target = (event.target as Element).closest<HTMLAnchorElement>('a.heading-anchor, [data-toc] a, [data-back-to-top], [aria-label="文章目录"] a, [data-footnote-ref], [data-footnote-backref]');
  if (!target || !target.hash || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const element = document.getElementById(decodeURIComponent(target.hash.slice(1)));
  if (!element) return;
  event.preventDefault(); scrolling?.stop(); clearScrollingListeners?.();
  history.replaceState(history.state, '', target.hash);
  if(target.hasAttribute('data-footnote-backref')){element.style.color='#ef4444';const timer=setTimeout(()=>element.style.color='',5000);cleanups.push(()=>clearTimeout(timer));}
  const y = target.hasAttribute('data-back-to-top') ? 0 : element.getBoundingClientRect().top + window.scrollY - (target.hasAttribute('data-footnote-backref')?window.innerHeight/2:100);
  if (reducedMotion.matches) { window.scrollTo(0,y); return; }
  const stop = () => { scrolling?.stop(); cleanup(); };
  const cleanup = () => { window.removeEventListener('wheel', stop); window.removeEventListener('touchmove', stop); if (clearScrollingListeners === cleanup) clearScrollingListeners = undefined; };
  clearScrollingListeners = cleanup;
  scrolling = animateValue({ keyframes:[window.scrollY+1,Math.max(0,y)],type:'spring',stiffness:1000,damping:250,onUpdate:latest => window.scrollTo(0,latest),onComplete:cleanup });
  window.addEventListener('wheel',stop,{passive:true,signal}); window.addEventListener('touchmove',stop,{passive:true,signal});
}, {signal});
const titleFormat = new Intl.DateTimeFormat('zh-CN', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Shanghai' });
const absoluteFormat = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Shanghai' });
const times = Array.from(document.querySelectorAll<HTMLTimeElement>('time[data-relative-time]')).map(time => {
  const date = new Date(time.dateTime);
  if (!Number.isFinite(date.getTime())) return null;
  time.title = `${time.hasAttribute('data-relative-calendar') ? time.dataset.dateKind + '：' : ''}${titleFormat.format(date)}`;
  return { time, date };
}).filter((item): item is { time: HTMLTimeElement; date: Date } => item !== null);
const units = [[60000,1000,'秒'],[3600000,60000,'分钟'],[86400000,3600000,'小时'],[2592000000,86400000,'天'],[31536000000,2592000000,'个月'],[Infinity,31536000000,'年']] as const;
let timesTimer: ReturnType<typeof setTimeout> | undefined;
const updateTimes = () => {
  clearTimeout(timesTimer);
  if (document.hidden) return;
  const now = new Date();
  let delay = 60000;
  times.forEach(({time, date}) => {
    const elapsed = now.getTime() - date.getTime();
    let text: string;
    if (time.hasAttribute('data-relative-calendar')) text = recentDateLabel(date, now);
    else if (Math.abs(Math.floor(-elapsed / 86400000)) > Number(time.dataset.absoluteAfter || 29)) text = absoluteFormat.format(date);
    else if (elapsed <= 0) { text = '刚刚'; delay = 1000; }
    else {
      const [, unit, label] = units.find(([limit]) => elapsed < limit)!;
      text = `${unit === 1000 ? Math.ceil(elapsed / unit) : Math.round(elapsed / unit)} ${label}前`;
      if (unit === 1000) delay = 1000;
    }
    if (time.textContent !== text) time.textContent = text;
  });
  if (times.length) timesTimer = setTimeout(updateTimes, delay);
};
updateTimes();
if (times.length) {
  document.addEventListener('visibilitychange', updateTimes, { signal });
  cleanups.push(() => clearTimeout(timesTimer));
}

if (location.pathname.includes('/timeline/')) {
  const params = new URLSearchParams(location.search), type = params.get('type'), year = params.get('year');
  document.querySelectorAll<HTMLElement>('[data-entry-type]').forEach(row => { row.hidden = (type === 'note' && row.dataset.entryType !== 'notes') || (type === 'post' && row.dataset.entryType !== 'posts') || (!!year && row.closest<HTMLElement>('[data-year-group]')?.dataset.year !== year); });
  document.querySelectorAll<HTMLElement>('[data-month-group]').forEach(group => { group.hidden = !Array.from(group.querySelectorAll<HTMLElement>('[data-entry-type]')).some(row => !row.hidden); });
  document.querySelectorAll<HTMLElement>('[data-year-group]').forEach(group => {
    const count = Array.from(group.querySelectorAll<HTMLElement>('[data-entry-type]')).filter(row => !row.hidden).length;
    group.hidden = count === 0;
    const label = group.querySelector('[data-year-count]');
    if (label) label.textContent = `本年 ${count} 篇`;
  });
  const total = document.querySelector('[data-timeline-count]');
  if (total) total.textContent = String(Array.from(document.querySelectorAll<HTMLElement>('[data-entry-type]')).filter(row => !row.hidden).length);
}


cleanups.push(()=>{cancelAnimationFrame(headerFrame);scrolling?.stop();clearScrollingListeners?.();});
cleanups.push(mountListReveal());
}
document.addEventListener('astro:page-load',initializePage);
document.addEventListener('astro:before-swap',event=>{
  dispose?.();
  event.newDocument.documentElement.dataset.listMotion = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'off' : 'on';
});
