// Reveal visible batches, rather than delaying every item in a long archive.
export function mountListReveal() {
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-list-reveal]'));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  if (!rows.length || reduced.matches) return () => {};
  const animations = new Map<HTMLElement, Animation>();
  const show = (row: HTMLElement) => {
    row.dataset.listRevealed = '';
    animations.get(row)?.cancel();
    animations.delete(row);
  };
  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting && !entry.target.hasAttribute('data-list-revealed') && !(entry.target as HTMLElement).closest('[hidden]'));
    visible.sort((a, b) => a.target.compareDocumentPosition(b.target) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
    visible.forEach((entry, index) => {
      const row = entry.target as HTMLElement;
      observer.unobserve(row);
      // Independent translate preserves PostItem's magnetic hover transform.
      const animation = row.animate([
        { opacity: 0, translate: '0 18px', offset: 0 },
        { opacity: 1, translate: '0 -1px', offset: .7 },
        { opacity: 1, translate: '0 0', offset: 1 },
      ], { duration: 420, delay: Math.min(index, 4) * 45, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' });
      animations.set(row, animation);
      animation.onfinish = () => show(row);
    });
  }, { rootMargin: '0px 0px -12px 0px', threshold: 0 });
  rows.forEach(row => observer.observe(row));
  const focus = (event: FocusEvent) => {
    const row = (event.target as Element).closest<HTMLElement>('[data-list-reveal]');
    if (row) { observer.unobserve(row); show(row); }
  };
  const finish = () => { observer.disconnect(); rows.forEach(show); };
  const preference = () => { if (reduced.matches) finish(); };
  document.addEventListener('focusin', focus);
  reduced.addEventListener('change', preference);
  return () => {
    finish();
    document.removeEventListener('focusin', focus);
    reduced.removeEventListener('change', preference);
  };
}
