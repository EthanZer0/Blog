import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const flipDuration = 420;

export function timeProgress(now: Date) {
  const year = now.getFullYear();
  const start = new Date(year, 0, 1).getTime();
  const end = new Date(year + 1, 0, 1).getTime();
  const midnight = new Date(year, now.getMonth(), now.getDate()).getTime();
  const nextMidnight = new Date(year, now.getMonth(), now.getDate() + 1).getTime();
  return {
    day: String(Math.floor((Date.UTC(year, now.getMonth(), now.getDate()) - Date.UTC(year, 0, 1)) / 86400000) + 1).padStart(3, '0'),
    year: String(Math.floor((now.getTime() - start) / (end - start) * 100)).padStart(2, '0'),
    today: ((now.getTime() - midnight) / (nextMidnight - midnight) * 100).toFixed(3).padStart(6, '0'),
  };
}

function Digit({ value, animate }: { value: string; animate: boolean }) {
  const previous = useRef(value);
  const [flip, setFlip] = useState<{ from: string; to: string } | null>(null);
  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = value;
    // Hydration shows the current time directly; only real digit changes flip.
    if (!animate || document.hidden || from === value || !/^\d$/.test(from) || !/^\d$/.test(value)) {
      setFlip(null);
      return;
    }
    setFlip({ from, to: value });
    const timer = setTimeout(() => setFlip(null), flipDuration);
    return () => clearTimeout(timer);
  }, [value, animate]);
  return <span className="flip-digit" aria-hidden="true">
    <span className="flip-half flip-top"><span className="flip-face">{value}</span></span>
    <span className="flip-half flip-bottom"><span className="flip-face">{flip?.from ?? value}</span></span>
    {flip && <>
      <span key={`top-${flip.from}-${flip.to}`} className="flip-half flip-top flip-leaf-top"><span className="flip-face">{flip.from}</span></span>
      <span key={`bottom-${flip.from}-${flip.to}`} className="flip-half flip-bottom flip-leaf-bottom"><span className="flip-face">{flip.to}</span></span>
    </>}
  </span>;
}

function Counter({ label, value, suffix, animate }: { label: string; value: string; suffix: string; animate: boolean }) {
  return <div className="timeline-counter">
    <span className="mb-2 block text-[11px] md:text-xs">{label}</span>
    <div className="flex items-baseline gap-1" role="img" aria-label={label + ' ' + value + suffix}>
      <span className="inline-flex items-center gap-[2px]">
        {[...value].map((digit, index) => digit === '.' ? <span key={index} aria-hidden="true" className="flip-point">.</span> : <Digit key={index} value={digit} animate={animate} />)}
      </span>
      <span className="text-[10px] md:text-xs" aria-hidden="true">{suffix}</span>
    </div>
  </div>;
}

export default function TimelineProgress() {
  const [progress, setProgress] = useState<ReturnType<typeof timeProgress> | null>(null);
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const preference = () => setAnimate(!reduced.matches);
    preference();
    reduced.addEventListener('change', preference);
    const update = () => setProgress(timeProgress(new Date()));
    update();
    const timer = setInterval(() => { if (!document.hidden) update(); }, 1000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); reduced.removeEventListener('change', preference); };
  }, []);
  return <div className="timeline-counters grid grid-cols-[1fr_0.8fr_1.6fr] gap-3 md:flex md:gap-10">
    <Counter label="今年第几天" value={progress?.day ?? '–––'} suffix="天" animate={animate} />
    <Counter label="今年进度" value={progress?.year ?? '––'} suffix="%" animate={animate} />
    <Counter label="今日进度" value={progress?.today ?? '––.–––'} suffix="%" animate={animate} />
  </div>;
}
