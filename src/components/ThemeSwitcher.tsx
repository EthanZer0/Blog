// Adapted from Shiro ThemeSwitcher.tsx: exact SVGs, sizes and indicator offsets.
import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
const iconClassNames = 'h-4 w-4 text-current'

const SunIcon = () => (
  <svg
    className={iconClassNames}
    fill="none"
    height="24"
    shapeRendering="geometricPrecision"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="24"
  >
    <circle cx="12" cy="12" r="5" />
    <path d="M12 1v2" />
    <path d="M12 21v2" />
    <path d="M4.22 4.22l1.42 1.42" />
    <path d="M18.36 18.36l1.42 1.42" />
    <path d="M1 12h2" />
    <path d="M21 12h2" />
    <path d="M4.22 19.78l1.42-1.42" />
    <path d="M18.36 5.64l1.42-1.42" />
  </svg>
)

const SystemIcon = () => (
  <svg
    className={iconClassNames}
    fill="none"
    height="24"
    shapeRendering="geometricPrecision"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="24"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
)

const DarkIcon = () => (
  <svg
    fill="none"
    height="24"
    shapeRendering="geometricPrecision"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
    width="24"
    className={iconClassNames}
  >
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
)


export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<string>();
  useEffect(() => { setTheme(document.documentElement.dataset.themePreference || 'system'); }, []);
  function choose(next: string) {
    const update = () => {
      flushSync(() => setTheme(next));
      document.documentElement.dataset.themePreference = next;
      document.documentElement.dataset.theme = next === 'system' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : next;
      try { localStorage.setItem('shiro-theme', next); } catch {}
    };
    if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(update);
    else update();
  }
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const sync = () => { if (document.documentElement.dataset.themePreference === 'system') document.documentElement.dataset.theme = media.matches ? 'dark' : 'light'; };
    media.addEventListener('change', sync); return () => media.removeEventListener('change', sync);
  }, []);
  return <div className="relative inline-block isolate">
    {theme && <div className="absolute top-[4px] z-[-1] size-[32px] rounded-full bg-base-100 shadow-[0_1px_2px_0_rgba(127.5,127.5,127.5,.2),_0_1px_3px_0_rgba(127.5,127.5,127.5,.1)] duration-200" style={{left:({light:4,system:36,dark:68} as Record<string,number>)[theme]}} />}
    <div className="inline-flex rounded-full border border-zinc-200 p-[3px] dark:border-zinc-700">
      {([['light','浅色主题',SunIcon],['system','跟随系统主题',SystemIcon],['dark','深色主题',DarkIcon]] as const).map(([value,label,Icon]) => <button key={value} type="button" aria-label={label} aria-pressed={theme===value} onClick={()=>choose(value)} className="rounded-inherit inline-flex h-[32px] w-[32px] items-center justify-center border-0 text-current"><Icon /></button>)}
    </div>
  </div>;
}
