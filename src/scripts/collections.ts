import { readWorkFilters, workFilterQuery, workStatusLabel, type WorkFilters, type WorkStatus } from '../lib/work-filters';
import { withBase } from '../lib/url';

export function mountCollections() {
  const root = document.querySelector<HTMLElement>('[data-works-list], [data-work-detail]');
  if (!root) return () => {};
  const controller = new AbortController();
  const { signal } = controller;
  root.querySelectorAll<HTMLImageElement>('[data-work-cover] img').forEach(img => {
    const fail = () => {
      img.parentElement!.dataset.coverFailed = '';
      img.parentElement!.querySelector('[aria-hidden]')?.setAttribute('aria-hidden', 'false');
    };
    img.addEventListener('error', fail, { signal });
    if (img.complete && !img.naturalWidth) fail();
  });
  const initial = readWorkFilters(new URLSearchParams(location.search));
  const back = root.querySelector<HTMLAnchorElement>('[data-work-back]');
  if (back) {
    const query = workFilterQuery(initial);
    back.href = withBase('/collections/') + (query ? `?${query}` : '');
    return () => controller.abort();
  }
  const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-work-type]'));
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'));
  const results = root.querySelector<HTMLElement>('[data-works-results]')!;
  const empty = root.querySelector<HTMLElement>('[data-works-empty]')!;
  const reset = root.querySelector<HTMLButtonElement>('[data-work-reset]')!;
  const pathname = location.pathname;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let filters = initial, animation: Animation | undefined, revision = 0;
  const controls = () => {
    buttons.forEach(button => {
      const key = button.dataset.filter as keyof WorkFilters;
      button.setAttribute('aria-pressed', String(button.dataset.value === filters[key]));
      if (key === 'status' && button.dataset.value) button.textContent = workStatusLabel(button.dataset.value as WorkStatus, filters.type === 'book');
    });
    const query = workFilterQuery(filters);
    root.querySelectorAll<HTMLAnchorElement>('[data-work-link]').forEach(link => {
      const url = new URL(link.href);
      url.search = query;
      link.href = url.href;
    });
  };
  const apply = () => {
    let count = 0;
    rows.forEach(row => {
      row.hidden = !!((filters.type && row.dataset.workType !== filters.type) || (filters.status && row.dataset.workStatus !== filters.status));
      if (!row.hidden) count++;
    });
    root.querySelector('[data-work-count]')!.textContent = `${count} 件作品`;
    empty.hidden = count > 0;
    reset.hidden = rows.length === 0 || (!filters.type && !filters.status);
  };
  const update = async (next: WorkFilters, motion: boolean) => {
    const current = ++revision;
    animation?.cancel();
    filters = next;
    controls();
    // A filter change supersedes the initial staggered reveal.
    rows.forEach(row => {
      row.getAnimations().forEach(item => item.cancel());
      row.dataset.listRevealed = '';
    });
    if (!motion || reduced.matches) { apply(); return; }
    animation = results.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 80, fill: 'both' });
    try { await animation.finished; } catch { return; }
    if (current !== revision) return;
    apply();
    animation.cancel();
    animation = results.animate([{ opacity: 0, translate: '0 6px' }, { opacity: 1, translate: '0 0' }], { duration: 180, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' });
    try { await animation.finished; } catch { return; }
    if (current === revision) { animation.cancel(); animation = undefined; }
  };
  const select = (next: WorkFilters) => {
    if (next.type === filters.type && next.status === filters.status) return;
    const url = new URL(location.href);
    url.search = workFilterQuery(next);
    history.pushState({ ...history.state, scrollX, scrollY }, '', url);
    void update(next, true);
  };
  buttons.forEach(button => button.addEventListener('click', () => {
    const params = new URLSearchParams(workFilterQuery(filters));
    params.set(button.dataset.filter!, button.dataset.value!);
    select(readWorkFilters(params));
  }, { signal }));
  reset.addEventListener('click', () => select({ type: '', status: '' }), { signal });
  // Query-only history belongs to this filter, not Astro's page transition.
  window.addEventListener('popstate', event => {
    if (location.pathname !== pathname) return;
    event.stopImmediatePropagation();
    void update(readWorkFilters(new URLSearchParams(location.search)), false);
  }, { signal, capture: true });
  reduced.addEventListener('change', () => { if (reduced.matches) void update(filters, false); }, { signal });
  controls();
  apply();
  root.querySelector<HTMLElement>('[data-work-filters]')!.hidden = false;
  return () => { revision++; controller.abort(); animation?.cancel(); };
}
