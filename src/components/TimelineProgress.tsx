import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';

// Original TimelineProgress text, precision and two-second entry animation.
export default function TimelineProgress() {
  const [value, setValue] = useState({ year: 0, day: 0, yearPercent: 0, dayPercent: 0 });
  const reduced = useReducedMotion();
  useEffect(() => {
    const current = () => {
      const now = new Date(), year = now.getFullYear();
      const day = Math.floor((Date.UTC(year, now.getMonth(), now.getDate()) - Date.UTC(year,0,1))/86400000) + 1;
      const days = (Date.UTC(year+1,0,1)-Date.UTC(year,0,1))/86400000;
      return { year, day, yearPercent: day/days*100, dayPercent: (now.getHours()*3600+now.getMinutes()*60+now.getSeconds())/86400*100 };
    };
    const final = current();
    const control = animate(0,1,{ duration: reduced ? 0 : 2, onUpdate: progress => setValue({ year: final.year, day: Math.round(final.day*progress), yearPercent: final.yearPercent*progress, dayPercent: final.dayPercent*progress }) });
    let timer: ReturnType<typeof setInterval> | undefined;
    control.then(() => { timer = setInterval(() => setValue(current()), 1000); });
    return () => { control.stop(); clearInterval(timer); };
  }, [reduced]);
  return <><p><span className="shrink-0">今天是 {value.year || '…'} 年的第</span><span className="mx-1">{value.day}</span><span className="shrink-0">天</span></p><p>今年已过 {value.yearPercent.toFixed(6)}%</p><p>今天已过 {value.dayPercent.toFixed(6)}%</p></>;
}
