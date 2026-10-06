import { hydrateRoot } from 'react-dom/client';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import type { ImgHTMLAttributes } from 'react';
import 'react-photo-view/dist/react-photo-view.css';

// Original MobilePhotoView provider; preserve the build-time image element.
export function mountMobileImages(article: HTMLElement) {
  article.querySelectorAll<HTMLImageElement>('figure > span.group\\/image > img').forEach(image => {
    const parent = image.parentElement!;
    const props: ImgHTMLAttributes<HTMLImageElement> = { src: image.getAttribute('src')!, alt: image.alt, className: image.className, loading: 'lazy', style: { maxHeight:'100vh',maxWidth:'100%' } };
    if (image.title) props.title = image.title;
    if (image.hasAttribute('width')) props.width = image.getAttribute('width')!;
    if (image.hasAttribute('height')) props.height = image.getAttribute('height')!;
    hydrateRoot(parent, <PhotoProvider photoClosable><PhotoView src={props.src!}><img {...props} /></PhotoView></PhotoProvider>);
  });
}
