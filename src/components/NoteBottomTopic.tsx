import type {FC} from 'react';
import {useIsMobile,Divider} from './upstream/adapters';
import {Avatar} from './upstream/Avatar';
import {FloatPopover} from './FloatPopover';
import {NoteTopicDetail,type StaticTopic,type TopicNote} from './NoteTopicDetail';
import {withBase} from '../lib/url';
const NoteTopicMarkdownRender=({children}:{children:React.ReactNode})=><>{children}</>;
const textToBigCharOrWord = (name: string | undefined) => {
  if (!name) {
    return ''
  }
  const splitOnce = name.split(' ')[0]
  const bigChar = splitOnce.length > 4 ? name[0] : splitOnce
  return bigChar
}

export const NoteBottomTopic: FC<{topic:StaticTopic;notes:TopicNote[]}> = ({topic,notes}) => {
  const isMobile = useIsMobile()
  if (!topic) return null
  const { icon, name, introduce } = topic

  return (
    <div data-hide-print>
      <div className="font-medium">
        <strong>文章被专栏收录：</strong>
      </div>
      <Divider />
      <div className="flex items-center gap-4">
        <Avatar
          radius="full"
          size={60}
          imageUrl={icon}
          text={textToBigCharOrWord(name)}
          className="shrink-0"
          shadow={false}
          alt={`专栏 ${name} 的头像`}
        />
        <div className="flex grow flex-col self-start">
          <span className="mb-2 font-medium">
            <FloatPopover
              strategy="absolute"
              mobileAsSheet
              triggerElement={
                isMobile ? (
                  <span>{name}</span>
                ) : (
                  <a
                    href={withBase(`/notes/series/${encodeURIComponent(topic.slug)}/`)}
                  >
                    <span>{name}</span>
                  </a>
                )
              }
            >
              <NoteTopicDetail topic={topic} notes={notes} />
            </FloatPopover>
          </span>

          <div className="line-clamp-2 text-sm opacity-80">
            <NoteTopicMarkdownRender>{introduce}</NoteTopicMarkdownRender>
          </div>
        </div>
      </div>
    </div>
  )
}
