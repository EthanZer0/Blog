// Keep static Markdown HTML as a no-JS fallback, mount original display renderers when hydrated.
import {useEffect,useState,type ReactNode} from 'react';
import Masonry,{ResponsiveMasonry} from 'react-responsive-masonry';
import { createRoot, type Root } from 'react-dom/client';
import { FixedZoomedImage } from './upstream/ZoomedImage';
import { ShikiHighLighterWrapper } from './upstream/ShikiWrapper';
import { ImageRecords, WrappedWidth, type ImageRecord } from './upstream/adapters';
import { VideoPlayer } from './upstream/VideoPlayer';
import { Favicon } from './upstream/Favicon';
import { FloatPopover } from './FloatPopover';
import { withBase } from '../lib/url';
import MarkdownTabs from './MarkdownTabs';
import StaticLinkCard from './StaticLinkCard';
import { Tag } from './upstream/Tag';
import {GridMarkdownImages} from './upstream/GridImages';
import { Gallery } from './upstream/Gallery';
import 'react-photo-view/dist/react-photo-view.css';
function Measure({element,children}:{element:HTMLElement;children:(width:number)=>ReactNode}){const [width,set]=useState(element.clientWidth);useEffect(()=>{const observer=new ResizeObserver(()=>set(element.clientWidth));observer.observe(element);return()=>observer.disconnect();},[element]);return <WrappedWidth value={width}>{children(width)}</WrappedWidth>;}
export function mountArticleEnhancements(article:HTMLElement) {
  const roots:Root[]=[];
  const zoomEvents=new AbortController();
  let zoomGeneration=0;
  const releaseZoom=()=>{zoomGeneration++;document.body.removeAttribute('data-zoom-preparing');};
  document.addEventListener('medium-zoom:open',event=>{
    if(!(event.target instanceof HTMLImageElement)||!article.contains(event.target))return;
    const generation=++zoomGeneration;
    const body=document.body;
    body.setAttribute('data-zoom-preparing','');
    // medium-zoom hides the source before its freshly cloned image is decoded.
    // Keep the source visible until the replacement can be painted with the mask.
    queueMicrotask(async()=>{
      const images=Array.from(body.querySelectorAll<HTMLImageElement>('.medium-zoom-image--opened'));
      await Promise.allSettled(images.map(image=>image.decode()));
      if(generation===zoomGeneration)body.removeAttribute('data-zoom-preparing');
    });
  },{capture:true,signal:zoomEvents.signal});
  document.addEventListener('medium-zoom:close',releaseZoom,{capture:true,signal:zoomEvents.signal});
  const query=<T extends Element>(selector:string)=>Array.from(article.querySelectorAll<T>(selector)).filter(el=>{const owner=(el.matches('[data-tabs],[data-masonry],[data-grid-images]')?el.parentElement:el)?.closest('[data-tabs],[data-masonry],[data-grid-images]');return !owner||!article.contains(owner);});
  const records:ImageRecord[]=JSON.parse(article.closest<HTMLElement>('[data-image-records]')?.dataset.imageRecords||'[]');
  query<HTMLVideoElement>('video[data-video-player]').forEach(video=>{const src=video.getAttribute('src');if(!src)return;const host=document.createElement('div');video.replaceWith(host);const root=createRoot(host);roots.push(root);root.render(<VideoPlayer src={src} className="mx-auto select-none" playsInline/>);});
  query<HTMLAnchorElement>('a.shiro-link--underline:not([data-tag]):not([data-footnote-ref]):not([data-footnote-backref])').forEach(link=>{if(link.hash||link.closest('[data-link-card]'))return;const href=link.getAttribute('href')||'',html=link.innerHTML,host=document.createElement('span');link.replaceWith(host);const root=createRoot(host);roots.push(root);const self=new URL(href,location.href).origin===location.origin;root.render(<FloatPopover wrapperClassName="inline!" type="tooltip" triggerElement={<span className="inline items-center font-sans">{self?<span className="center mr-1 inline-flex size-4"><img className="inline size-4" alt="" src={withBase('/favicon.ico')}/></span>:<Favicon href={href}/>}<a className="shiro-link--underline" href={href} target={self?undefined:'_blank'} rel="noreferrer" dangerouslySetInnerHTML={{__html:html}}/></span>}><a href={href} target="_blank" rel="noreferrer" className="shiro-link--underline">{href}</a></FloatPopover>);});
  query<HTMLElement>('[data-tabs],[data-masonry],[data-grid-images]').forEach(tabs=>{const panels=Array.from(tabs.querySelectorAll<HTMLElement>(':scope > [data-tab-label]')).map(panel=>({label:panel.dataset.tabLabel!,html:panel.innerHTML}));const root=createRoot(tabs);roots.push(root);root.render(<MarkdownTabs panels={panels}/>);});
  query<HTMLElement>('[data-link-card]').forEach(card=>{const root=createRoot(card);roots.push(root);root.render(<StaticLinkCard href={card.dataset.href||'#'} title={card.dataset.title||card.textContent||card.dataset.href||''} description={card.dataset.description} image={card.dataset.image} color={card.dataset.color}/>);});
  query<HTMLElement>('[data-markdown-tag]').forEach(tag=>{const text=tag.textContent||'';tag.className='';const root=createRoot(tag);roots.push(root);root.render(<Tag text={text} className="rounded-full px-3 py-0"/>);});
  query<HTMLElement>('[data-shiro-code]').forEach(card=>{
    const pre=card.querySelector('pre'),host=document.createElement('div');if(!pre)return;
    const html=pre.outerHTML,content=pre.querySelector('code')?.textContent||'',lang=pre.dataset.language,filename=card.dataset.codeFilename;
    card.replaceWith(host);const root=createRoot(host);roots.push(root);root.render(<ShikiHighLighterWrapper lang={lang} content={content} attrs={filename?`filename="${filename}"`:undefined} renderedHTML={html} shouldCollapsed={!card.hasAttribute('data-code-expand')}/>);
  });
  query<HTMLElement>('[data-gallery]').forEach(gallery=>{const images=Array.from(gallery.querySelectorAll<HTMLImageElement>('img')).map(image=>({url:image.getAttribute('src')!,name:image.dataset.galleryName||image.alt,footnote:image.title}));const host=document.createElement('div');const parent=gallery.parentElement||article;gallery.replaceWith(host);const root=createRoot(host);roots.push(root);root.render(<Measure element={parent}>{()=> <ImageRecords value={records}><Gallery images={images}/></ImageRecords>}</Measure>);});
  query<HTMLElement>('[data-grid-images]').forEach(grid=>{const imagesSrc=Array.from(grid.querySelectorAll<HTMLImageElement>('img')).map(image=>image.getAttribute('src')!),style=grid.getAttribute('style')||'',ratio=Number(grid.dataset.ratio)||1;const root=createRoot(grid);roots.push(root);grid.removeAttribute('style');grid.className='';const Wrapper=({children,className}:{children:ReactNode;className?:string})=><div className={`relative grid w-full ${className||''}`} style={Object.fromEntries(style.split(';').filter(Boolean).map(entry=>{const [key,value]=entry.split(':');return [key.replace(/-([a-z])/g,(_,char)=>char.toUpperCase()),value];}))}>{children}</div>;root.render(<ImageRecords value={records}><GridMarkdownImages imagesSrc={imagesSrc} height={ratio} Wrapper={Wrapper}/></ImageRecords>);});
  query<HTMLElement>('[data-masonry]').forEach(masonry=>{const images=Array.from(masonry.querySelectorAll<HTMLImageElement>('img')).map(image=>image.getAttribute('src')!);const gap=masonry.dataset.gap||'8';const root=createRoot(masonry);roots.push(root);masonry.className='';root.render(<ImageRecords value={records}><ResponsiveMasonry columnsCountBreakPoints={{350:1,750:2}}><Masonry gutter={gap+'px'} className="[&_figure]:my-0">{images.map(src=><div key={src} className="relative flex min-w-0 grow"><Measure element={masonry}>{width=><FixedZoomedImage src={src} containerWidth={width/ (innerWidth>750?2:1)}/>}</Measure></div>)}</Masonry></ResponsiveMasonry></ImageRecords>);});
  query<HTMLImageElement>('figure > span.group\\/image > img').forEach(image=>{
    const figure=image.closest('figure')!,host=document.createElement('div');
    const props={src:image.getAttribute('src')!,alt:image.alt,title:image.title||undefined,width:Number(image.getAttribute('width'))||undefined,height:Number(image.getAttribute('height'))||undefined,containerWidth:figure.parentElement?.clientWidth||article.clientWidth};
    figure.replaceWith(host);const root=createRoot(host);roots.push(root);root.render(<ImageRecords value={records}><Measure element={host}>{width=><FixedZoomedImage {...props} containerWidth={width}/>}</Measure></ImageRecords>);
  });
  return ()=>{zoomEvents.abort();releaseZoom();roots.forEach(root=>root.unmount());};
}
