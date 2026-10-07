// Shiro NoteFontFab: original panel, font stacks, preview SVGs and storage key.
import { useEffect, useState, type ReactElement } from 'react';
import { toast } from 'sonner';
import { FloatPanel } from './upstream/FloatPanel';
import { MotionButtonBase } from './upstream/MotionButton';
import { LXGWFontSvg, SansFont, SerifFontSvg, YouZaiFontSvg } from './upstream/note-font-icons';

type Font = 'serif' | 'sans' | 'youzai' | 'lxgw';
const fonts = [
  { value: 'serif', label: '衬线体', preview: SerifFontSvg },
  { value: 'sans', label: '无衬线体', preview: SansFont },
  { value: 'lxgw', label: '霞鹜文楷', preview: LXGWFontSvg },
  { value: 'youzai', label: '悠哉体', preview: YouZaiFontSvg },
] as const;
const fontConfig = {
  youzai: {
    stylesheetUrl: 'https://fastly.jsdelivr.net/gh/Innei/static@master/fonts/yozai/stylesheet.css',
    fontFamily: "'Yozai', 'LXGW WenKai Screen R', var(--font-sans), var(--font-serif), system-ui",
  },
  sans: { fontFamily: 'var(--font-sans), system-ui' },
  lxgw: {
    stylesheetUrl: 'https://cdnjs.cloudflare.com/ajax/libs/lxgw-wenkai-screen-webfont/1.7.0/lxgwwenkaiscreenr.css',
    fontFamily: "'LXGW WenKai Screen R', Yozai, var(--font-sans), var(--font-serif), system-ui",
  },
};

function storedFont(): Font {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('note-font') || '"serif"');
    if (fonts.some(font => font.value === value)) return value as Font;
  } catch { /* Storage may be blocked or contain invalid data. */ }
  return 'serif';
}

function applyFont(container: HTMLElement, font: Exclude<Font, 'serif'>) {
  const config = fontConfig[font];
  // Query the current document: Astro can remove a dynamically loaded link on
  // navigation, so a cached element must never be treated as a loaded stylesheet.
  if ('stylesheetUrl' in config && !document.querySelector(`link[href="${config.stylesheetUrl}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = config.stylesheetUrl;
    link.crossOrigin = 'anonymous';
    link.onerror = () => {
      link.remove();
      toast.warning('字形字体暂时无法加载，已使用备用字体。');
    };
    document.head.append(link);
  }
  const rootStyle = getComputedStyle(document.documentElement);
  const resolved = config.fontFamily.replaceAll(/var\(--([^)]+)\)/g, (_, name: string) => rootStyle.getPropertyValue(`--${name}`).trim());
  const elements = () => [container, ...container.querySelectorAll<HTMLElement>('.rich-content')];
  const apply = () => elements().forEach(element => {
    element.style.setProperty('--note-font-override', resolved);
    element.style.setProperty('--rc-font-family', resolved);
    element.style.fontFamily = config.fontFamily;
  });
  apply();
  const observer = new MutationObserver(apply);
  observer.observe(container, { childList: true, subtree: true });
  return () => {
    observer.disconnect();
    elements().forEach(element => {
      element.style.removeProperty('--note-font-override');
      element.style.removeProperty('--rc-font-family');
      element.style.removeProperty('font-family');
    });
  };
}

export default function NoteFontSettings({ triggerElement }: { triggerElement: ReactElement }) {
  const [font, setFont] = useState<Font>('serif');
  useEffect(() => {
    setFont(storedFont());
    const update = (event: StorageEvent) => { if (event.key === 'note-font' || event.key === null) setFont(storedFont()); };
    window.addEventListener('storage', update);
    return () => window.removeEventListener('storage', update);
  }, []);
  useEffect(() => {
    const article = document.querySelector<HTMLElement>('[data-article-body].markdown--note');
    if (article && font !== 'serif') return applyFont(article, font);
  }, [font]);
  const select = (value: Font) => {
    setFont(value);
    try { localStorage.setItem('note-font', JSON.stringify(value)); } catch { /* Keep the choice for this page. */ }
  };
  return <FloatPanel triggerElement={triggerElement}>
    <main role="dialog" aria-label="字形选择">
      <div className="mb-4 text-lg font-medium">字形选择</div>
      <div className="grid w-[200px] grid-cols-2 grid-rows-2 gap-4">
        {fonts.map(({ value, label, preview: Preview }) => <MotionButtonBase
          key={value} aria-label={label} aria-pressed={font === value}
          className={`center flex aspect-square select-none rounded-lg ring-1 ring-slate-100 dark:ring-neutral-800 duration-200 ${font === value ? 'ring-accent!' : ''}`}
          onClick={() => select(value)}><Preview /></MotionButtonBase>)}
      </div>
    </main>
  </FloatPanel>;
}
