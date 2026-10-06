import { animateValue } from 'motion';
import mediumZoom from 'medium-zoom';

// Port MagneticHoverEffect's bounds, 0.05 attraction and exact easing.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
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
window.addEventListener('scroll', () => { if (!headerFrame) headerFrame = requestAnimationFrame(updateHeaderLogo); }, { passive: true });
updateHeaderLogo();

const article = document.querySelector<HTMLElement>('[data-article-body]');
if (article) {
  if (matchMedia('(max-width:1024px)').matches) import('../components/MobileImage').then(({ mountMobileImages }) => mountMobileImages(article));
  else mediumZoom(article.querySelectorAll<HTMLImageElement>('img'), {});
  article.querySelectorAll<HTMLElement>('pre').forEach(pre => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'code-copy center absolute right-2 top-2 z-[3] flex rounded-md border border-accent/5 bg-accent/80 p-1.5 text-xs text-white backdrop-blur duration-200 opacity-0 group-hover:opacity-100';
    const card = pre.closest<HTMLElement>('[data-shiro-code]');
    if (card?.dataset.codeColor) { button.style.backgroundColor = card.dataset.codeColor; button.style.borderColor = `${card.dataset.codeColor}0d`; }
    if (card?.dataset.codeFilename) button.style.top = '3rem'; button.innerHTML = '<i class="i-mingcute-copy-2-fill block size-4" aria-hidden="true"></i>'; button.setAttribute('aria-label', '复制代码');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || '');
        button.innerHTML = '<i class="i-mingcute-check-line block size-4" aria-hidden="true"></i>'; button.setAttribute('aria-label', '代码已复制');
      } catch { button.textContent = '请手动复制'; }
      setTimeout(() => { button.innerHTML = '<i class="i-mingcute-copy-2-fill block size-4" aria-hidden="true"></i>'; button.setAttribute('aria-label','复制代码'); }, 2000);
    });
    (card || pre).append(button);
    const area = card?.querySelector<HTMLElement>('[data-code-scroll]');
    if (area && card?.hasAttribute('data-code-expand')) area.style.maxHeight = 'none';
    if (area && !card?.hasAttribute('data-code-expand') && area.scrollHeight >= window.innerHeight/2) {
      const wrapper = document.createElement('div'); wrapper.className = 'relative'; area.replaceWith(wrapper); wrapper.append(area);
      const expand = document.createElement('button'); expand.type = 'button'; expand.className = 'absolute inset-x-0 bottom-0 flex items-center justify-center py-2 text-xs'; expand.innerHTML = '<i class="i-mingcute-arrow-to-down-line"></i><span class="ml-2">展开</span>';
      const updateMask = () => { const top = area.scrollTop > 1, bottom = area.scrollTop + area.clientHeight < area.scrollHeight-1; area.classList.toggle('mask-both-lg',top && bottom); area.classList.toggle('mask-b-lg',!top && bottom); area.classList.toggle('mask-t-lg',top && !bottom); expand.hidden = !bottom; };
      area.addEventListener('scroll',updateMask,{passive:true}); wrapper.append(expand); updateMask();
      expand.addEventListener('click',() => { area.style.maxHeight = 'none'; area.classList.remove('mask-both-lg','mask-b-lg','mask-t-lg'); area.removeEventListener('scroll',updateMask); expand.remove(); });
    }
  });
  const headings = Array.from(article.querySelectorAll<HTMLElement>('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]'));
  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc] a'));
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
    const active = headings.filter(heading => heading.getBoundingClientRect().top <= 140).at(-1) || headings[0];
    tocLinks.forEach(link => {
      if (active && decodeURIComponent(link.hash.slice(1)) === active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    scheduled = false;
  }
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(updateReading); } };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('load', schedule, { once: true });
  updateReading();
}

// Original scroller spring; cancel cleanly when the reader takes control.
let scrolling: ReturnType<typeof animateValue> | undefined;
document.addEventListener('click', event => {
  const target = (event.target as Element).closest<HTMLAnchorElement>('a.heading-anchor, [data-toc] a, [data-back-to-top], [aria-label="文章目录"] a');
  if (!target || !target.hash || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const element = document.getElementById(decodeURIComponent(target.hash.slice(1)));
  if (!element) return;
  event.preventDefault(); scrolling?.stop();
  history.replaceState(history.state, '', target.hash);
  const y = target.hasAttribute('data-back-to-top') ? 0 : element.getBoundingClientRect().top + window.scrollY - 100;
  if (reducedMotion.matches) { window.scrollTo(0,y); return; }
  const stop = () => { scrolling?.stop(); cleanup(); };
  const cleanup = () => { window.removeEventListener('wheel', stop); window.removeEventListener('touchmove', stop); };
  scrolling = animateValue({ keyframes:[window.scrollY+1,Math.max(0,y)],type:'spring',stiffness:1000,damping:250,onUpdate:latest => window.scrollTo(0,latest),onComplete:cleanup });
  window.addEventListener('wheel',stop,{passive:true}); window.addEventListener('touchmove',stop,{passive:true});
});
const times = Array.from(document.querySelectorAll<HTMLTimeElement>('time[data-relative-time]'));
const updateTimes = () => times.forEach(time => {
  const elapsed = Date.now() - new Date(time.dateTime).getTime();
  const units = [[60000,1000,'秒'],[3600000,60000,'分钟'],[86400000,3600000,'小时'],[2592000000,86400000,'天'],[31536000000,2592000000,'个月'],[Infinity,31536000000,'年']] as const;
  if (Math.abs(Math.floor(-elapsed/86400000)) > Number(time.dataset.absoluteAfter || 29)) time.textContent = new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'long',day:'numeric',weekday:'long',timeZone:'Asia/Shanghai'}).format(new Date(time.dateTime));
  else if (elapsed <= 0) time.textContent = '刚刚';
  else { const [,unit,label] = units.find(([limit]) => elapsed < limit)!; time.textContent = `${unit === 1000 ? Math.ceil(elapsed/unit) : Math.round(elapsed/unit)} ${label}前`; }
  time.title = new Intl.DateTimeFormat('zh-CN',{dateStyle:'full',timeStyle:'short',timeZone:'Asia/Shanghai'}).format(new Date(time.dateTime));
});
updateTimes(); if (times.length) setInterval(updateTimes,1000);

if (location.pathname.includes('/timeline/')) {
  const params = new URLSearchParams(location.search), type = params.get('type'), year = params.get('year');
  document.querySelectorAll<HTMLElement>('[data-entry-type]').forEach(row => { row.hidden = (type === 'note' && row.dataset.entryType !== 'notes') || (type === 'post' && row.dataset.entryType !== 'posts') || (!!year && row.closest('[data-year-group]')?.querySelector('h2')?.textContent?.trim().split('(')[0] !== year); });
  document.querySelectorAll<HTMLElement>('[data-year-group]').forEach(group => { group.hidden = !Array.from(group.querySelectorAll<HTMLElement>('[data-entry-type]')).some(row => !row.hidden); });
}

document.querySelectorAll<HTMLElement>('[data-gallery]').forEach(root => {
  const strip = root.querySelector<HTMLElement>('.gallery-container'); if (!strip) return;
  const count = strip.children.length; let index = 0, timer: ReturnType<typeof setInterval> | undefined, autoplay = !reducedMotion.matches, forward = true;
  const go = (i: number) => { strip.scrollTo({ left: (strip.firstElementChild?.clientWidth || 0)*i, behavior: reducedMotion.matches ? 'instant' : 'smooth' }); };
  const update = () => { index = Math.min(count-1, Math.floor((strip.scrollLeft+75)/(strip.firstElementChild?.clientWidth || 1))); root.querySelectorAll<HTMLElement>('[data-gallery-arrow]').forEach(arrow => { arrow.hidden = Number(arrow.dataset.galleryArrow)<0 ? index===0 : index===count-1; }); root.querySelectorAll<HTMLButtonElement>('[data-gallery-index]').forEach(button => { const selected = Number(button.dataset.galleryIndex)===index; button.setAttribute('aria-pressed',String(selected)); button.classList.toggle('opacity-100!',selected); }); };
  const cancel = () => { autoplay=false; clearInterval(timer); };
  root.addEventListener('wheel',cancel,{passive:true}); root.addEventListener('touchstart',cancel,{passive:true}); strip.addEventListener('scroll',update,{passive:true});
  root.querySelectorAll<HTMLButtonElement>('[data-gallery-step],[data-gallery-index]').forEach(button => button.addEventListener('click',() => { cancel(); go(button.dataset.galleryIndex === undefined ? index+Number(button.dataset.galleryStep) : Number(button.dataset.galleryIndex)); }));
  const observer = new IntersectionObserver(entries => { clearInterval(timer); if (entries[0].isIntersecting && autoplay && count>1) timer=setInterval(() => { if (index===count-1) forward=false; if (index===0) forward=true; go(index+(forward?1:-1)); },5000); }); observer.observe(root); update();
});
