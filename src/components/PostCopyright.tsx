import { FloatPopover } from './FloatPopover';
import { toast } from 'sonner';

export default function PostCopyright({ title, link, published, updated, name, license }: {
  title: string;
  link: string;
  published: string;
  updated?: string;
  name: string;
  license: string;
}) {
  const modified = updated && new Date(updated).getTime() > new Date(published).getTime();
  const date = modified ? updated! : published;
  const dateLabel = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Shanghai',
  }).format(new Date(date));

  return (
    <section id="copyright" aria-label="文章信息与许可" className="mt-12 space-y-1 text-sm leading-relaxed text-[#7c786f] md:mt-16 dark:text-[#a8a49c]">
      <p className="m-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="min-w-0 break-words">{title}</span>
        <span aria-hidden="true">·</span>
        <span>{name}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={date} className="whitespace-nowrap">{modified ? '更新于' : '发布于'} {dateLabel}</time>
      </p>
      <p className="m-0 flex min-w-0 items-center gap-1">
        <a href={link} className="min-w-0 break-all transition-colors hover:text-accent">{link}</a>
        <button
          type="button"
          aria-label="复制文章链接"
          title="复制文章链接"
          data-hide-print
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md transition-colors hover:bg-zinc-200/50 hover:text-accent dark:hover:bg-zinc-700/50"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              toast.success('已复制文章链接');
            } catch {
              toast.error('复制失败，请检查浏览器的剪贴板权限。');
            }
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="8" y="8" width="12" height="12" rx="2" />
            <path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
          </svg>
        </button>
      </p>
      <p className="m-0">
        {license === 'reserved' ? '转载请注明作者与文章出处。' : <>
          本文采用{' '}
          <FloatPopover asChild mobileAsSheet type="tooltip" triggerElement={
            <a className="shiro-link--underline" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noreferrer">CC BY-NC-SA 4.0</a>
          }>
            知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议
          </FloatPopover>
          {' '}许可，转载请署名、注明出处，非商业使用并以相同协议共享。
        </>}
      </p>
    </section>
  );
}
