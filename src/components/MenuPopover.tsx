import type { ReactElement } from 'react';
import type { NavItem } from '../site.config';
import { withBase } from '../lib/url';
import { FloatPopover } from './FloatPopover';
export default function MenuPopover({children,subMenu}:{children:ReactElement;subMenu?:NavItem[]}){if(!subMenu?.length)return children;return <FloatPopover strategy="fixed" placement="bottom" offset={10} headless popoverWrapperClassNames="z-[19] relative" popoverClassNames="select-none outline-hidden relative flex w-[130px] flex-col focus-visible:ring-0!" triggerElement={children}>{subMenu.map(item=><a key={item.path} href={withBase(item.path)} className="relative flex w-full items-center space-x-2 px-4 py-3 duration-200 hover:bg-accent/5 hover:text-accent justify-around" role="button"><span><i className={item.icon}/></span><span>{item.title}</span></a>)}</FloatPopover>;}
