import clsx from 'clsx';
import {StaticImage as Image,useMarkdownImageRecord} from './adapters';
import type {FC} from 'react';
import {memo,useRef} from 'react';
import {Blurhash} from 'react-blurhash';
import {PhotoProvider,PhotoView} from 'react-photo-view';
import {LazyLoad} from './LazyLoad';
const addImageUrlResizeQuery=(src:string,_size:number)=>src;
export const GridMarkdownImages: FC<{
  imagesSrc: string[]
  Wrapper: React.ComponentType<{children:React.ReactNode;className?:string}>
  height: number
}> = ({ imagesSrc, Wrapper, height = 1 }) => (
  <div
    className="relative"
    style={{
      paddingBottom: `${height * 100}%`,
    }}
  >
    <PhotoProvider photoClosable>
      <Wrapper className="absolute inset-0">
        {imagesSrc.map((src) => (
          <GridZoomImage key={src} src={src} />
        ))}
      </Wrapper>
    </PhotoProvider>
  </div>
)

const GridZoomImage: FC<{ src: string }> = memo(({ src }) => {
  const { accent, height, width, blurHash } = useMarkdownImageRecord(src) || {}
  const cropUrl = addImageUrlResizeQuery(src, 600)
  const imageEl = useRef<HTMLImageElement>(null)
  const wGreaterThanH = width && height ? width > height : true

  const ImageComponent = height && width ? Image : 'img'

  return (
    <div
      className="center relative flex size-full overflow-hidden rounded-md bg-cover bg-center"
      style={{
        backgroundColor: accent,
      }}
    >
      {!!blurHash && (
        <Blurhash
          hash={blurHash}
          resolutionX={32}
          resolutionY={32}
          className="size-full!"
        />
      )}
      <LazyLoad offset={30}>
        <PhotoView src={src}>
          <ImageComponent
            loading="lazy"
            alt=""
            height={height}
            width={width}
            src={cropUrl}
            ref={imageEl}
            className={clsx(
              'm-0! max-w-max object-cover',
              wGreaterThanH ? 'h-full' : 'w-full',
            )}
          />
        </PhotoView>
      </LazyLoad>
    </div>
  )
})

GridZoomImage.displayName = 'GridZoomImage'
