// tabs.tsx: same Radix tabs, classes and shared Motion underline; panels are build-time Markdown.
import * as Tabs from '@radix-ui/react-tabs';
import { motion } from 'motion/react';
import { useId,useState,useEffect,useRef } from 'react';
import { mountArticleEnhancements } from './ArticleEnhancements';
function Panel({html}:{html:string}){const ref=useRef<HTMLDivElement>(null);useEffect(()=>{if(ref.current)return mountArticleEnhancements(ref.current);},[html]);return <div ref={ref} dangerouslySetInnerHTML={{__html:html}}/>;}
export default function MarkdownTabs({panels}:{panels:{label:string;html:string}[]}){const id=useId(),[active,set]=useState(panels[0]?.label||'');return <Tabs.Root value={active} onValueChange={set}><Tabs.List className="flex gap-2">{panels.map(panel=><Tabs.Trigger key={panel.label} value={panel.label} className="relative flex px-2 py-1 text-sm font-bold focus:outline-hidden text-zinc-600 transition-colors duration-300 dark:text-zinc-300">{panel.label}{active===panel.label&&<motion.div layoutId={`tab${id}`} layout className="absolute inset-x-2 -bottom-1 h-[2px] rounded-md bg-accent"/>}</Tabs.Trigger>)}</Tabs.List>{panels.map(panel=><Tabs.Content key={panel.label} value={panel.label} className="animate-in fade-in animation-duration-500" ><Panel html={panel.html}/></Tabs.Content>)}</Tabs.Root>;}
