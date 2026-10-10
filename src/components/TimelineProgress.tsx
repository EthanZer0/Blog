import { useEffect, useState } from 'react';

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

function Digit({ value }: { value: string }) {
  return <span className="flip-digit" aria-hidden="true">
    <span className="flip-half flip-top"><span className="flip-face">{value}</span></span>
    <span className="flip-half flip-bottom"><span className="flip-face">{value}</span></span>
  </span>;
}

function Counter({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return <div className="timeline-counter">
    <span className="mb-2 block text-[11px] md:text-xs">{label}</span>
    <div className="flex items-baseline gap-1" role="img" aria-label={label + ' ' + value + suffix}>
      <span className="inline-flex items-center gap-[2px]">
        {[...value].map((digit, index) => digit === '.' ? <span key={index} aria-hidden="true" className="flip-point">.</span> : <Digit key={index} value={digit} />)}
      </span>
      <span className="text-[10px] md:text-xs" aria-hidden="true">{suffix}</span>
    </div>
  </div>;
}

export default function TimelineProgress() {
  const [progress, setProgress] = useState<ReturnType<typeof timeProgress> | null>(null);
  useEffect(() => {
    const update = () => setProgress(timeProgress(new Date()));
    update();
    const timer = setInterval(() => { if (!document.hidden) update(); }, 1000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  return <div className="timeline-counters grid grid-cols-[1fr_0.8fr_1.6fr] gap-3 md:flex md:gap-10">
    <Counter label="今年第几天" value={progress?.day ?? '–––'} suffix="天" />
    <Counter label="今年进度" value={progress?.year ?? '––'} suffix="%" />
    <Counter label="今日进度" value={progress?.today ?? '––.–––'} suffix="%" />
  </div>;
}
