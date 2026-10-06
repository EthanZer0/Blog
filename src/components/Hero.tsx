// Adapted from Shiro Hero.tsx and TwoColumnLayout.tsx at the pinned upstream commit.
import { createElement, useEffect } from 'react';
import { motion, stagger, useAnimate, useReducedMotion } from 'motion/react';
import { softBouncePreset, microReboundPreset } from './upstream/spring';
import { siteConfig } from '../site.config';
import { withBase } from '../lib/url';

export default function Hero() {
  const [scope, animate] = useAnimate();
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) return;
    const controls = animate('.hero-letter', { opacity: [0.001, 1], y: [10, 0] }, {
      ...microReboundPreset, duration: 0.1, delay: stagger(0.05),
    });
    return () => controls.stop();
  }, [animate, reduced]);
  return (
    <div ref={scope} className="mx-auto mt-20 min-w-0 max-w-7xl overflow-hidden lg:mt-[-4.5rem] lg:h-dvh lg:min-h-[800px] lg:px-8">
      <div className="relative mx-auto block size-full min-w-0 max-w-[1800px] flex-col flex-wrap items-center lg:flex lg:flex-row">
        <div className="center mt-[120px] flex w-full flex-col lg:mt-0 lg:h-1/2 lg:w-1/2">
          <div className="relative max-w-full lg:max-w-2xl">
            <motion.div className="group relative text-center leading-[4] lg:text-left [&_*]:inline-block" initial={false} transition={softBouncePreset}>
              {siteConfig.hero.title.template.map((item, i) => createElement(item.type, { className: item.class, key: i },
                <span>{Array.from(item.text).map((letter, j) => <span key={j} className="hero-letter inline-block whitespace-pre">{letter}</span>)}</span>))}
            </motion.div>
            <div className="my-3 text-center lg:text-left"><span className="opacity-80">{siteConfig.hero.description}</span></div>
            <ul className="center mx-[60px] mt-8 flex flex-wrap gap-4 gap-y-6 lg:mx-auto lg:mt-28 lg:justify-start lg:gap-y-4">
              {siteConfig.social.map((social) => <li key={social.label}>
                <a href={withBase(social.url)} aria-label={social.label} className="social-link center inline-flex size-10 rounded-full text-2xl transition-colors hover:bg-zinc-100 hover:text-accent dark:hover:bg-zinc-800">
                  <i className={social.icon} aria-hidden="true" />
                </a>
              </li>)}
            </ul>
          </div>
        </div>
        <div className="center flex w-full flex-col lg:h-auto lg:w-1/2 lg:items-end lg:justify-end">
          <div className="relative max-w-full lg:max-w-2xl">
            <div className="mt-24 size-[200px] lg:mt-0 lg:size-[300px]">
              <img height={300} width={300} src={withBase(siteConfig.avatar)} alt={`${siteConfig.owner} 的头像（演示占位图）`} fetchPriority="high" className="aspect-square w-full rounded-full border border-slate-200 dark:border-neutral-800" />
            </div>
          </div>
        </div>
        <div className="center inset-x-0 bottom-0 mt-12 flex flex-col text-neutral-800/80 lg:absolute lg:mt-0 dark:text-neutral-200/80">
          <small className="text-center">{siteConfig.hero.hitokoto}</small>
          <a href="#recent" aria-label="阅读最近更新" className="mt-8 animate-bounce"><i className="i-mingcute-right-line rotate-90 text-2xl" aria-hidden="true" /></a>
        </div>
      </div>
    </div>
  );
}
