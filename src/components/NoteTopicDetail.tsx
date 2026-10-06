import type {FC} from 'react';
import {useIsMobile,Divider} from './upstream/adapters';
import {MdiClockOutline} from './upstream/clock';
import {MdiFountainPenTip} from './upstream/pen';
import {withBase} from '../lib/url';
const DividerVertical=()=> <span className="mx-2 inline-block h-4 w-px bg-black/30 dark:bg-white/30"/>;
const NoteTopicMarkdownRender=({children}:{children:React.ReactNode})=><>{children}</>;
const Loading=({className}:{className:string})=><span className={className}/>;
export type StaticTopic={slug:string;name:string;icon?:string;introduce:string;description?:string};
export type TopicNote={title:string;url:string;created:string;modified?:string};
export const NoteTopicDetail: FC<{ topic: StaticTopic;notes:TopicNote[] }> = (props) => {
  const { topic,notes } = props
  const t=(key:string,values?:{total:number})=>key==='topic_recent_update'?'最近更新：':`共 ${values?.total||0} 篇文章`;
  const data={data:notes,pagination:{total:notes.length}},isLoading=false;
  const isMobile = useIsMobile()
  const isClient = true
  if (!isClient) {
    return null
  }

  return (
    <div className="flex w-[400px] flex-col">
      <a
        href={withBase(`/notes/series/${encodeURIComponent(topic.slug)}/`)}
      >
        <h1 className="m-0! inline-block pb-2 text-lg font-medium">
          {topic.name}
        </h1>
        {isMobile && (
          <i className="i-mingcute-arrow-right-up-line ml-2 translate-y-[2px] opacity-70" />
        )}
      </a>

      <div className="line-clamp-2 break-all text-neutral">
        <NoteTopicMarkdownRender>{topic.introduce}</NoteTopicMarkdownRender>
      </div>
      {topic.description && (
        <>
          <Divider />
          <div className="leading-8 opacity-90">
            <NoteTopicMarkdownRender>
              {topic.description}
            </NoteTopicMarkdownRender>
          </div>
        </>
      )}

      <Divider />
      {isLoading ? (
        <Loading className="my-4" />
      ) : (
        data?.data[0] && (
          <p className="flex items-center">
            <MdiClockOutline />
            <DividerVertical />
            <span className="shrink-0">{t('topic_recent_update')}</span>
            <DividerVertical />
            <span className="inline-flex min-w-0 shrink">
              <a
                href={data.data[0].url}
                className="truncate"
              >
                {data?.data[0]?.title}
              </a>
              <span className="shrink-0">
                （
                <time
                  >{new Intl.DateTimeFormat("zh-CN",{dateStyle:"long"}).format(new Date(data.data[0].modified||data.data[0].created))}</time>
                ）
              </span>
            </span>
          </p>
        )
      )}

      {!isLoading && (
        <>
          <Divider />
          <p className="flex items-center">
            <MdiFountainPenTip />
            <DividerVertical />
            {t('topic_total_articles', { total: data?.pagination?.total ?? 0 })}
          </p>
        </>
      )}
    </div>
  )
}
