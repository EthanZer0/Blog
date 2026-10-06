import { animateValue, animate } from 'motion';
import { Spring,softBouncePreset,softSpringPreset } from '../components/upstream/spring';
let dispose:(()=>void)|undefined;
function initializePage(){
 dispose?.();const controller=new AbortController(),signal=controller.signal,cleanups:Array<()=>void>=[];
 dispose=()=>{controller.abort();cleanups.forEach(cleanup=>cleanup());};

// Port MagneticHoverEffect's bounds, 0.05 attraction and exact easing.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
if(!reducedMotion.matches){
 document.querySelectorAll<HTMLElement>('[data-home-animation]').forEach(element=>{element.style.opacity='.0001';element.style.transform='translateY(50px)';const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){const control=animate(element,{opacity:1,y:0},element.dataset.homeAnimation==='posts'?Spring.presets.snappy:softBouncePreset);cleanups.push(()=>control.stop());observer.disconnect();}},{threshold:0});observer.observe(element);cleanups.push(()=>observer.disconnect());});
 document.querySelectorAll<HTMLElement>('[data-year-group]').forEach(element=>{const control=animate(element,{opacity:[.00001,1],scale:[.96,1],y:[10,0]},softSpringPreset);cleanups.push(()=>control.stop());});
}
document.querySelectorAll<HTMLElement>('.post-item').forEach(item => {
  item.addEventListener('pointerenter', event => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    const rect = item.getBoundingClientRect();
    item.style.transition = 'transform 0.2s cubic-bezier(0.33, 1, 0.68, 1)';
    item.style.setProperty('--origin-x', `${(event.clientX - rect.left) / rect.width * 100}%`);
    item.style.setProperty('--origin-y', `${(event.clientY - rect.top) / rect.height * 100}%`);
  });
  item.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    const rect = item.getBoundingClientRect();
    item.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .05}px, ${(event.clientY - rect.top - rect.height / 2) * .05}px)`;
  });
  item.addEventListener('pointerleave', () => {
    item.style.transform = 'translate(0px, 0px)';
    item.style.transition = 'transform 0.4s cubic-bezier(0.33, 1, 0.68, 1)';
  });
});

const headerLogo = document.querySelector<HTMLElement>('.header-logo');
let headerFrame = 0;
function updateHeaderLogo() {
  if (headerLogo) headerLogo.style.opacity = String(document.querySelector('[data-header-hide-bg]') && matchMedia('(min-width:1024px)').matches ? 1 : 1 - Math.floor(Math.max(0, Math.min(1, (window.scrollY - 197) / 50)) * 100) / 100);
  headerFrame = 0;
}
window.addEventListener('scroll', () => { if (!headerFrame) headerFrame = requestAnimationFrame(updateHeaderLogo); }, { passive: true, signal });
updateHeaderLogo();

const article = document.querySelector<HTMLElement>('[data-article-body]');
if (article) {
  import('../components/ArticleEnhancements').then(({mountArticleEnhancements})=>{if(!signal.aborted)cleanups.push(mountArticleEnhancements(article));});
  const progress = document.querySelectorAll<HTMLElement>('[data-reading-progress]');
  let scheduled = false;
  function updateReading() {
    const region = document.querySelector<HTMLElement>('[data-reading-region]') || article!;
    const top = region.getBoundingClientRect().top + window.scrollY;
    const percent = Math.floor(Math.max(0, Math.min(100, (window.scrollY - top + Math.min(window.scrollY, window.innerHeight)) / Math.max(1,region.offsetHeight) * 100)));
    const vertical = document.querySelector<HTMLElement>('[data-progress-vertical]'); if (vertical) vertical.style.height = `${percent}%`;
    const rail = document.querySelector<HTMLElement>('[data-reading-vertical]'); if (rail) rail.style.opacity = percent >= 100 ? '0' : '1';
    progress.forEach(bar => {
      const rounded = Math.round(percent);
      bar.setAttribute('aria-valuenow', String(rounded));
      const label = bar.querySelector('[data-progress-label]');
      if (label) label.textContent = `${rounded}%`;
      bar.querySelector('[data-progress-ring]')?.setAttribute('stroke-dashoffset', String(100 - percent));
    });
    document.querySelectorAll<HTMLElement>('[data-back-to-top]').forEach(link => {
      link.style.opacity = percent > 10 ? '.5' : '0';
      link.style.pointerEvents = percent > 10 ? 'auto' : 'none';
      link.tabIndex = percent > 10 ? 0 : -1;
    });
    scheduled = false;
  }
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } };
  window.addEventListener('scroll', schedule, { passive: true, signal });
  window.addEventListener('resize', schedule, { passive: true, signal });
  window.addEventListener('load', schedule, { once: true, signal });
  updateReading();
}

// Original scroller spring; cancel cleanly when the reader takes control.
let scrolling: ReturnType<typeof animateValue> | undefined;
document.addEventListener('click', event => {
  const target = (event.target as Element).closest<HTMLAnchorElement>('a.heading-anchor, [data-toc] a, [data-back-to-top], [aria-label="文章目录"] a, [data-footnote-ref], [data-footnote-backref]');
  if (!target || !target.hash || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const element = document.getElementById(decodeURIComponent(target.hash.slice(1)));
  if (!element) return;
  event.preventDefault(); scrolling?.stop();
  history.replaceState(history.state, '', target.hash);
  if(target.hasAttribute('data-footnote-backref')){element.style.color='#ef4444';const timer=setTimeout(()=>element.style.color='',5000);cleanups.push(()=>clearTimeout(timer));}
  const y = target.hasAttribute('data-back-to-top') ? 0 : element.getBoundingClientRect().top + window.scrollY - (target.hasAttribute('data-footnote-backref')?window.innerHeight/2:100);
  if (reducedMotion.matches) { window.scrollTo(0,y); return; }
  const stop = () => { scrolling?.stop(); cleanup(); };
  const cleanup = () => { window.removeEventListener('wheel', stop); window.removeEventListener('touchmove', stop); };
  scrolling = animateValue({ keyframes:[window.scrollY+1,Math.max(0,y)],type:'spring',stiffness:1000,damping:250,onUpdate:latest => window.scrollTo(0,latest),onComplete:cleanup });
  window.addEventListener('wheel',stop,{passive:true,signal}); window.addEventListener('touchmove',stop,{passive:true,signal});
}, {signal});
const times = Array.from(document.querySelectorAll<HTMLTimeElement>('time[data-relative-time]'));
const updateTimes = () => times.forEach(time => {
  const elapsed = Date.now() - new Date(time.dateTime).getTime();
  const units = [[60000,1000,'秒'],[3600000,60000,'分钟'],[86400000,3600000,'小时'],[2592000000,86400000,'天'],[31536000000,2592000000,'个月'],[Infinity,31536000000,'年']] as const;
  if (Math.abs(Math.floor(-elapsed/86400000)) > Number(time.dataset.absoluteAfter || 29)) time.textContent = new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long',timeZone:'Asia/Shanghai'}).format(new Date(time.dateTime));
  else if (elapsed <= 0) time.textContent = '刚刚';
  else { const [,unit,label] = units.find(([limit]) => elapsed < limit)!; time.textContent = `${unit === 1000 ? Math.ceil(elapsed/unit) : Math.round(elapsed/unit)} ${label}前`; }
  time.title = new Intl.DateTimeFormat('zh-CN',{dateStyle:'full',timeStyle:'short',timeZone:'Asia/Shanghai'}).format(new Date(time.dateTime));
});
updateTimes(); if(times.length){const timer=setInterval(updateTimes,1000);cleanups.push(()=>clearInterval(timer));}

if (location.pathname.includes('/timeline/')) {
  const params = new URLSearchParams(location.search), type = params.get('type'), year = params.get('year');
  document.querySelectorAll<HTMLElement>('[data-entry-type]').forEach(row => { row.hidden = (type === 'note' && row.dataset.entryType !== 'notes') || (type === 'post' && row.dataset.entryType !== 'posts') || (!!year && row.closest('[data-year-group]')?.querySelector('h2')?.textContent?.trim().split('(')[0] !== year); });
  document.querySelectorAll<HTMLElement>('[data-year-group]').forEach(group => { group.hidden = !Array.from(group.querySelectorAll<HTMLElement>('[data-entry-type]')).some(row => !row.hidden); });
}


cleanups.push(()=>{cancelAnimationFrame(headerFrame);scrolling?.stop();});
}
document.addEventListener('astro:page-load',initializePage);
document.addEventListener('astro:before-swap',()=>dispose?.());
