import { navigate } from 'astro:transitions/client';

// Keep a single preparation active; a newer route aborts the older one in Astro.
let active: { finish: () => void } | undefined;
let retry: (() => void) | undefined;

document.addEventListener('astro:before-preparation', event => {
  const feedback = document.querySelector<HTMLElement>('[data-navigation-feedback]');
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!feedback || !header) { active?.finish(); return; }
  const carryProgress = feedback.hasAttribute('data-loading');
  active?.finish();
  const error = feedback.querySelector<HTMLElement>('[data-navigation-error]')!;
  const status = feedback.querySelector<HTMLElement>('[data-navigation-status]')!;
  error.hidden = true;
  retry = undefined;
  const message = error.querySelector<HTMLElement>('[data-route-message]')!;
  const links = Array.from(header.querySelectorAll<HTMLAnchorElement>('a[href]')).filter(link => {
    const url = new URL(link.href);
    return url.pathname === event.to.pathname && url.search === event.to.search;
  });
  const source = event.sourceElement?.closest<HTMLAnchorElement>('a');
  if (source && !links.includes(source)) links.push(source);
  links.forEach(link => link.dataset.navigationPending = '');
  let resumeFailure: (() => void) | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const session = {
    finish() {
      clearTimeout(timer);
      delete feedback.dataset.loading;
      status.textContent = '';
      links.forEach(link => delete link.dataset.navigationPending);
      delete header.dataset.routePending;
      event.signal.removeEventListener('abort', abort);
      resumeFailure?.();
      if (active === session) { error.hidden = true; retry = undefined; active = undefined; }
    },
  };
  // Astro starts the next preparation synchronously after aborting the previous
  // one. Let it inherit pending feedback before cleaning up a standalone abort.
  const abort = () => queueMicrotask(() => { if (active === session) session.finish(); });
  active = session;
  event.signal.addEventListener('abort', abort, { once: true });
  const show = () => {
    if (active !== session || event.signal.aborted) return;
    header.dataset.routePending = '';
    feedback.dataset.loading = '';
    status.textContent = '正在加载页面…';
  };
  if (carryProgress) show();
  else timer = setTimeout(show, 200);

  const recover = async () => {
    clearTimeout(timer);
    links.forEach(link => delete link.dataset.navigationPending);
    delete header.dataset.routePending;
    delete feedback.dataset.loading;
    status.textContent = '';
    // A failed history traversal has already changed the address bar.
    if (event.navigationType === 'traverse') history.replaceState(history.state, '', event.from.href);
    message.textContent = '页面暂时未能打开，请稍后重试。';
    error.hidden = false;
    retry = () => { void navigate(event.to.href, { history: event.navigationType === 'traverse' ? 'replace' : 'auto' }); };
    // Suspend only this failed preparation until retry/another navigation aborts
    // it. This prevents Astro's hard-navigation fallback from losing the old page.
    await new Promise<void>(resolve => {
      resumeFailure = resolve;
      if (event.signal.aborted) resolve();
    });
  };

  const loader = event.loader;
  event.loader = async () => {
    try {
      await loader();
      if (active !== session || event.signal.aborted) return;
      if (event.defaultPrevented) {
        // Downloads and external redirects retain Astro's native behavior.
        if (event.to.origin === location.origin && !event.formData && !/\.[a-z0-9]+\/?$/i.test(event.to.pathname)) await recover();
        else session.finish();
        return;
      }
      clearTimeout(timer);
      delete feedback.dataset.loading;
      status.textContent = '';
    } catch {
      if (active === session && !event.signal.aborted) await recover();
    }
  };
});

document.addEventListener('click', event => {
  if ((event.target as Element).closest('[data-route-retry]')) retry?.();
});
document.addEventListener('astro:before-swap', () => active?.finish());
window.addEventListener('pagehide', () => active?.finish());
