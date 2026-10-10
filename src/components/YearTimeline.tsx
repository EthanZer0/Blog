import { motion, useInView, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef } from 'react';
import { FloatPopover } from './FloatPopover';
import '../styles/home-year-timeline.css';

type Post = { id: string; created: string; title: string; url: string };
const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const calendar = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
});
function dateParts(value: Date) {
  const parts = calendar.formatToParts(value);
  const number = (type: string) => Number(parts.find(part => part.type === type)?.value);
  return { year: number('year'), month: number('month'), day: number('day') };
}
function organizePosts(posts: Post[]) {
  const current = dateParts(new Date());
  const months = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(current.year, current.month - 1 - 11 + index, 1));
    const year = date.getUTCFullYear(), month = date.getUTCMonth() + 1;
    const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return { year, month, days, posts: [] as Array<Post & { day: number }> };
  });
  for (const post of posts) {
    const date = dateParts(new Date(post.created));
    months.find(month => month.year === date.year && month.month === date.month)?.posts.push({ ...post, day: date.day });
  }
  return months.map(month => {
    const byDay = new Map<number, typeof month.posts>();
    for (const post of month.posts) {
      const peers = byDay.get(post.day) ?? [];
      peers.push(post);
      byDay.set(post.day, peers);
    }
    const offsets = new Map<(typeof month.posts)[number], number>();
    byDay.forEach(peers => peers.forEach((post, index) => offsets.set(post, index - (peers.length - 1) / 2)));
    return { ...month, posts: month.posts.map(post => ({ ...post, offset: offsets.get(post)! })) };
  });
}

export default function YearTimeline({ publications }: { publications: Post[] }) {
  const months = useMemo(() => organizePosts(publications), [publications]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const visible = useInView(sectionRef, { once: true, amount: 0.1 });
  const reduced = useReducedMotion();
  useEffect(() => {
    const scroll = scrollRef.current;
    if (!scroll) return;
    const latest = () => { scroll.scrollLeft = scroll.scrollWidth; };
    latest();
    const observer = new ResizeObserver(latest);
    observer.observe(scroll);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="year-timeline" className="home-year-timeline mt-24 w-full" aria-label="近十二个月的文章时间轴">
      <h2 className="home-section-heading">时间...</h2>
      <div className="year-timeline-scroll scrollbar-none" ref={scrollRef}>
        <motion.div
          className="year-timeline-chart"
          initial={reduced ? false : { opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
          animate={visible || reduced ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : undefined}
          transition={{ duration: reduced ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="year-timeline-axis">
            {months.map(({ year, month, days, posts }) => (
              <div className="year-timeline-month" key={year + '-' + month}>
                <FloatPopover mobileAsSheet type="tooltip" trigger="both" asChild placement="bottom"
                  triggerElement={
                    <button type="button" className="year-timeline-node" aria-label={year + '年' + month + '月，发布了 ' + posts.length + ' 篇文章'}>
                      <span className="year-timeline-dot" />
                      {posts.length > 0 && <span className="year-timeline-total" style={{ height: Math.min(12 + posts.length * 8, 88) + 'px' }} />}
                    </button>
                  }
                >
                  {year} 年 {month} 月 · 发布了 {posts.length} 篇文章
                </FloatPopover>
                {posts.map((post, index) => {
                  const offset = post.offset;
                  return <FloatPopover key={post.url} mobileAsSheet type="tooltip" trigger="both" asChild placement="bottom"
                    triggerElement={
                      <button type="button" className="year-timeline-post" aria-label={post.title}
                        style={{ left: 'calc(' + (16 + (post.day - 1) / days * 78) + '% + ' + offset * 4 + 'px)' }}>
                        <span className="year-timeline-mark" style={{ height: (14 + Math.min(index, 4) * 3) + 'px' }} />
                      </button>
                    }
                  >
                    <a className="shiro-link--underline" href={post.url}>{post.title}</a>
                    <span className="ml-2 text-sm opacity-60">{calendar.format(new Date(post.created))}</span>
                  </FloatPopover>;
                })}
                <span className="year-timeline-label"><span>{year}</span><span>{monthNames[month - 1]}</span></span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
