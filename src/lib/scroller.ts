import { animateValue } from 'motion';
let cancel: (() => void) | undefined;

export function springScrollToElement(element: HTMLElement, offset = -100) {
  cancel?.();
  const y = Math.max(0, element.getBoundingClientRect().top + scrollY + offset);
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
    scrollTo(0, y);
    return Promise.resolve();
  }
  return new Promise<void>(resolve => {
    const events = new AbortController();
    const finish = () => {
      events.abort();
      if (cancel === stop) cancel = undefined;
      resolve();
    };
    const stop = () => { animation.stop(); finish(); };
    const animation = animateValue({
      keyframes: [scrollY + 1, y], type: 'spring', stiffness: 1000, damping: 250,
      onUpdate: value => scrollTo(0, value), onComplete: finish,
    });
    cancel = stop;
    addEventListener('wheel', stop, { passive: true, signal: events.signal });
    addEventListener('touchmove', stop, { passive: true, signal: events.signal });
    document.addEventListener('astro:before-swap', stop, { once: true, signal: events.signal });
  });
}
