import { animate } from 'motion';
import { Spring } from '../components/upstream/spring';
import { createAutumnBackground } from './autumn-background';
import { createFallingBackground } from './background/falling';
import { createParticleBackground } from './background/particles';
import { selectBackground } from './background/types';
import type { BackgroundEffect, BackgroundMode, BackgroundRenderer } from './background/types';

let dispose: (() => void) | undefined;

export function mountSeasonalBackground() {
  dispose?.();
  const canvas = document.querySelector<HTMLCanvasElement>('[data-seasonal-background]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;
  const events = new AbortController(), signal = events.signal;
  const mobile = matchMedia('(max-width:1024px)'), reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let effect: BackgroundEffect | null = null, renderer: BackgroundRenderer | undefined;
  let frame = 0, lastTime = 0, width = 0, height = 0, revision = 0, midnight = 0;
  let opacity: ReturnType<typeof animate> | undefined;
  let pendingEffect: BackgroundEffect | null = null;
  function stop() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
  function resize() {
    if (width === innerWidth && height === innerHeight) return;
    width = innerWidth; height = innerHeight; canvas!.width = width; canvas!.height = height;
    renderer?.resize(width, height);
  }
  function draw(now: number) {
    const dt = lastTime ? Math.max(0, Math.min(.05, (now - lastTime) / 1000)) : 0;
    lastTime = now; renderer?.draw(now, dt); frame = requestAnimationFrame(draw);
  }
  function start(next: BackgroundEffect) {
    stop(); effect = next; pendingEffect = null;
    renderer = next === 'autumn' ? createAutumnBackground(ctx!) : next === 'sakura' || next === 'snow' ? createFallingBackground(ctx!, next === 'snow') : createParticleBackground(ctx!, next === 'fireflies');
    canvas!.width = width = innerWidth; canvas!.height = height = innerHeight;
    renderer.resize(width, height); ctx!.clearRect(0, 0, width, height);
    canvas!.dataset.backgroundEffect = next; canvas!.hidden = false; canvas!.style.opacity = '0';
    frame = requestAnimationFrame(draw);
    opacity = animate(canvas!, { opacity: 1 }, Spring.presets.smooth);
  }
  function update() {
    const next = selectBackground(canvas!.dataset.backgroundMode as BackgroundMode, document.documentElement.dataset.theme === 'dark');
    const hidden = !next || mobile.matches || reduced.matches || !!document.querySelector('[data-article-body]');
    if (hidden || document.hidden) {
      revision++; pendingEffect = null; opacity?.stop(); stop(); canvas!.hidden = hidden;
      return;
    }
    if (next === pendingEffect) { resize(); return; }
    if (next !== effect || !renderer) {
      const id = ++revision; pendingEffect = next; opacity?.stop();
      if (canvas!.hidden || !renderer) start(next!);
      else {
        opacity = animate(canvas!, { opacity: 0 }, Spring.presets.smooth);
        opacity.then(() => { if (id === revision) start(next!); });
      }
      return;
    }
    // A quick theme reversal must cancel the pending outgoing transition.
    const resuming = canvas!.hidden || !frame || pendingEffect !== null;
    revision++; pendingEffect = null; canvas!.hidden = false;
    if (resuming) { opacity?.stop(); opacity = animate(canvas!, { opacity: 1 }, Spring.presets.smooth); }
    resize(); if (!frame) frame = requestAnimationFrame(draw);
  }
  function scheduleMidnight() {
    clearTimeout(midnight);
    const now = new Date(), next = new Date(now); next.setHours(24, 0, 0, 0);
    midnight = window.setTimeout(() => { update(); scheduleMidnight(); }, next.getTime() - now.getTime());
  }
  const themeObserver = new MutationObserver(update);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  document.addEventListener('astro:after-swap', update, { signal });
  document.addEventListener('visibilitychange', () => { update(); scheduleMidnight(); }, { signal });
  window.addEventListener('resize', update, { passive: true, signal });
  window.addEventListener('mousedown', event => { if (!canvas!.hidden && !document.hidden) renderer?.pointerDown?.(event.clientX, event.clientY); }, { signal });
  mobile.addEventListener('change', update); reduced.addEventListener('change', update);
  dispose = () => {
    revision++; events.abort(); themeObserver.disconnect();
    mobile.removeEventListener('change', update); reduced.removeEventListener('change', update);
    clearTimeout(midnight); opacity?.stop(); stop();
  };
  update(); scheduleMidnight();
  return dispose;
}
