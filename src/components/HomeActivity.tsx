import { ScrollArea } from './upstream/ScrollArea';
import { IcTwotoneSignpost, FaSolidFeatherAlt } from './upstream/menu-collection';

type Publication = { id: string; title: string; url: string; type: 'post' | 'note' };
// ActivityRecent / ActivityCard: only public article publication events are available statically.
export default function HomeActivity({ publications }: { publications: Publication[] }) {
  return <ScrollArea mask rootClassName="h-[400px] relative max-h-[80vh]">
    <ul className="shiro-timeline mt-4 flex flex-col pb-8 pl-2">
      {publications.map(entry => <li key={`${entry.type}-${entry.id}`} className="flex min-w-0 justify-between">
        <div className="pb-4 text-base">
          <div className="flex translate-y-1/4 gap-2">
            <div className="rounded-full border shrink-0 border-accent/30 text-xs center inline-flex size-6 text-accent">{entry.type === 'post' ? <IcTwotoneSignpost /> : <FaSolidFeatherAlt />}</div>
            <div className="space-x-2"><small>发布了</small>{' '}<a href={entry.url}><b>{entry.title}</b></a></div>
          </div>
        </div>
      </li>)}
    </ul>
  </ScrollArea>;
}
