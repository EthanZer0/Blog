import { createPortal } from 'react-dom';
// Browser-only adapters for original Shiro display components; no remote data providers.
import { createContext, useContext, useEffect, useRef, useState, type Ref, type ImgHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const clsxm=(...values:ClassValue[])=>twMerge(clsx(values));
export const stopPropagation=(event:{stopPropagation():void})=>event.stopPropagation();
export const getViewport=()=>({w:innerWidth,h:innerHeight});
export function useViewport<T>(selector:(v:{w:number;h:number})=>T){const [size,set]=useState({w:0,h:0});useEffect(()=>{const update=()=>set(getViewport());update();addEventListener('resize',update);return()=>removeEventListener('resize',update);},[]);return selector(size);}
export function useIsMobile(){return useViewport(v=>v.w<=1024);}
export function useIsUnMounted(){const ref=useRef(false);useEffect(()=>{ref.current=false;return()=>{ref.current=true;};},[]);return ref;}
export function useStateToRef<T>(value:T){const ref=useRef(value);ref.current=value;return ref;}
export function useEventCallback<T extends (...args:any[])=>any>(fn:T){const ref=useStateToRef(fn);const stable=useRef((...args:Parameters<T>)=>ref.current(...args));return stable.current;}
export type ImageRecord={src:string;width:number;height:number;accent?:string;blurHash?:string};
export const ImageRecords=createContext<ImageRecord[]>([]);
export function useMarkdownImageRecord(src:string){return useContext(ImageRecords).find(image=>image.src===src);}
export const WrappedWidth=createContext(0);
export function useWrappedElementSize(){return {w:useContext(WrappedWidth)};}
export function calculateDimensions({width,height,max}:{width:number;height:number;max:{width:number;height:number}}){if(width===0||height===0)throw new Error('Invalid image size');const ratio=Math.min(max.width/width||1,max.height/height||1,1);return {width:width*ratio,height:height*ratio};}
export function Divider({className=''}:{className?:string}){return <hr className={`my-4 h-[0.5px] border-0 bg-black/30 dark:bg-white/30 ${className}`}/>;}
export function StaticImage({priority,fetchPriority,...props}:ImgHTMLAttributes<HTMLImageElement>&{priority?:boolean;ref?:Ref<HTMLImageElement>}){return <img {...props} fetchPriority={fetchPriority} loading={priority?'eager':props.loading}/>;}
export const isDev=false,isServerSide=typeof window==='undefined';

export function RootPortal({children,to}:{children:React.ReactNode;to?:HTMLElement}){const [mounted,set]=useState(false);useEffect(()=>set(true),[]);return mounted?createPortal(children,to||document.body):null;}

export function useIsDark(){const [dark,set]=useState(false);useEffect(()=>{const update=()=>set(document.documentElement.dataset.theme==='dark');update();const observer=new MutationObserver(update);observer.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});return()=>observer.disconnect();},[]);return dark;}

const messages={"aria_like_post":"点赞这篇文章","aria_share_post":"分享这篇文章","aria_like_note":"点赞这条手记","aria_share_note":"分享这条手记","aria_donate":"向作者捐赠","aria_login":"读者登录","aria_theme_light":"切换到浅色主题","aria_theme_system":"切换到系统主题","aria_theme_dark":"切换到深色主题","aria_volume":"音量","aria_progress":"进度","aria_fab":"浮动操作按钮","aria_toc":"显示目录","aria_algolia":"Algolia","aria_pin":"置顶这篇文章","aria_comment":"评论这篇文章","aria_header_drawer":"头部抽屉按钮","aria_header_action":"头部操作","video_download":"下载","video_mute":"静音","video_unmute":"取消静音","video_play":"播放","video_pause":"暂停","video_fullscreen":"全屏","video_exit_fullscreen":"退出全屏","aria_site_owner_avatar":"站点所有者头像","aria_view_on_github":"在 GitHub 上查看"} as Record<string,string>;
export function useTranslations(_namespace:string){return (key:string)=>messages[key]||key;}
export const nextFrame=(fn:()=>void)=>requestAnimationFrame(()=>requestAnimationFrame(fn));
