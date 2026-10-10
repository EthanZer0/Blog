import { ScrollArea } from './upstream/ScrollArea';

type Publication = { id: string; title: string; url: string; type: 'post' | 'note'; date: string; updated: boolean };
const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Shanghai',
});

// Static activities are derived from public publication and modification dates.
export default function HomeActivity({ publications }: { publications: Publication[] }) {
  return <ScrollArea mask rootClassName="relative h-[420px] max-h-[65vh]">
    <ul className="m-0 flex list-none flex-col gap-6 pb-6 pl-0 pr-4">
      {publications.map(entry => <li key={`${entry.type}-${entry.id}`} className="recent-activity min-w-0 pl-4">
        <p className="m-0 text-base leading-loose">
          <span>{entry.updated ? '更新了' : '发布了'}{entry.type === 'post' ? '文稿' : '手记'}</span>
          {' '}<a className="recent-title" href={entry.url}>{entry.title}</a>
        </p>
        <time className="mt-2 block text-[0.8125rem] tabular-nums" dateTime={entry.date}>{dateFormat.format(new Date(entry.date))}</time>
      </li>)}
    </ul>
  </ScrollArea>;
}
