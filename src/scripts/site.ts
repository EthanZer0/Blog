import mediumZoom from 'medium-zoom';

// Standard page navigation: each script initializes once, no SPA listener lifecycle.
const themeToggle = document.querySelector<HTMLButtonElement>('#theme-toggle');
function syncThemeButton() { themeToggle?.setAttribute('aria-pressed', String(document.documentElement.dataset.theme === 'dark')); }
syncThemeButton();
themeToggle?.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('shiro-theme', next); } catch { /* Storage can be unavailable in private contexts. */ }
  syncThemeButton();
});

const article = document.querySelector<HTMLElement>('[data-article-body]');
if (article) {
  mediumZoom(article.querySelectorAll<HTMLImageElement>('img'), { background: 'var(--color-root-bg)', margin: 24 });
  article.querySelectorAll<HTMLElement>('pre').forEach(pre => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'code-copy'; button.innerHTML = '<i class="i-mingcute-copy-2-fill block size-4" aria-hidden="true"></i>'; button.setAttribute('aria-label', '复制代码');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(pre.querySelector('code')?.textContent || '');
        button.innerHTML = '<i class="i-mingcute-check-line block size-4" aria-hidden="true"></i>'; button.setAttribute('aria-label', '代码已复制');
      } catch { button.textContent = '请手动复制'; }
      setTimeout(() => { button.innerHTML = '<i class="i-mingcute-copy-2-fill block size-4" aria-hidden="true"></i>'; button.setAttribute('aria-label','复制代码'); }, 2000);
    });
    (pre.closest('[data-shiro-code]') || pre).append(button);
  });
  const headings = Array.from(article.querySelectorAll<HTMLElement>('h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]'));
  const tocLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-toc] a'));
  const progress = document.querySelectorAll<HTMLProgressElement>('[data-reading-progress]');
  let scheduled = false;
  function updateReading() {
    const top = article!.getBoundingClientRect().top + window.scrollY;
    const range = Math.max(1, article!.offsetHeight - window.innerHeight + 120);
    const percent = Math.max(0, Math.min(100, (window.scrollY - top + 120) / range * 100));
    progress.forEach(bar => { bar.value = percent; });
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

document.querySelectorAll<HTMLElement>('[data-timeline-filter]').forEach(container => {
  container.querySelectorAll<HTMLButtonElement>('button[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      container.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelectorAll<HTMLElement>('[data-entry-type]').forEach(row => { row.hidden = filter !== 'all' && row.dataset.entryType !== filter; });
      document.querySelectorAll<HTMLElement>('[data-year-group]').forEach(group => { group.hidden = !Array.from(group.querySelectorAll<HTMLElement>('[data-entry-type]')).some(row => !row.hidden); });
    });
  });
});
