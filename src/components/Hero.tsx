import { createElement } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { softBouncePreset, microReboundPreset } from './upstream/spring';
import { FloatPopover } from './FloatPopover';
import { siteConfig } from '../site.config';
import { withBase } from '../lib/url';

// Hero / TextUpTransitionView / BottomToUpTransitionView from the pinned Shiro source.
export default function Hero() {
  const reduced = useReducedMotion();
  const template = siteConfig.hero.title.template;
  const titleDelay = template.reduce((sum, item) => sum + (item.text?.length || 0), 0) * .05;
  const entrance = { opacity: .001, y: 50 };
  return (
    <div className="mx-auto mt-20 min-w-0 max-w-7xl overflow-hidden lg:mt-[-4.5rem] lg:h-dvh lg:min-h-[800px] lg:px-8">
      <div className="relative mx-auto block size-full min-w-0 max-w-[1800px] flex-col flex-wrap items-center lg:flex lg:flex-row">
        <div className="center mt-[120px] flex w-full flex-col lg:mt-0 lg:h-1/2 lg:w-1/2">
          <div className="relative max-w-full lg:max-w-2xl">
            <motion.div className="hero-title group relative text-center leading-[4] lg:text-left [&_*]:inline-block" initial={reduced ? false : { opacity: .0001, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={softBouncePreset}>
              {template.map((item, i) => {
                const initialDelay = template.slice(0, i).reduce((sum, previous) => sum + (previous.text?.length || 0), 0) * .05;
                return item.text
                  ? createElement(item.type, { className: item.class, key: i },
                    <div>{Array.from(item.text).map((letter, j) => <motion.span key={j} className="hero-letter inline-block whitespace-pre" initial={reduced ? false : { transform: 'translateY(10px)', opacity: .001 }} animate={{ transform: 'translateY(0px)', opacity: 1 }} transition={{ ...microReboundPreset, duration: .1, delay: initialDelay + j * .05 }}>{letter}</motion.span>)}</div>)
                  : createElement(item.type, { className: item.class, key: i });
              })}
            </motion.div>
            <motion.div className="hero-description my-3 text-center lg:text-left" initial={reduced ? false : entrance} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ...softBouncePreset, delay: reduced ? 0 : titleDelay + .5 }}><span className="opacity-80">{siteConfig.hero.description}</span></motion.div>
            <ul className="center mx-[60px] mt-8 flex flex-wrap gap-4 gap-y-6 lg:mx-auto lg:mt-28 lg:justify-start lg:gap-y-4">
              {siteConfig.social.map((social, i) => <motion.li className="hero-social inline-block" key={social.label} initial={reduced ? false : entrance} animate={{ opacity: 1, y: 0 }} transition={{ duration: .5, ...softBouncePreset, delay: reduced ? 0 : titleDelay + .5 + i * .1 }}>
                <FloatPopover type="tooltip" triggerElement={
                  <motion.a href={withBase(social.url)} target="_blank" rel="noreferrer" aria-label={social.label} whileFocus={reduced ? undefined : { scale: 1.02 }} whileHover={reduced ? undefined : { scale: 1.02 }} whileTap={reduced ? undefined : { scale: .95 }} style={{ background: social.color }} className="social-link center flex aspect-square size-10 rounded-full text-2xl text-white">
                    <i className={social.icon} aria-hidden="true" />
                  </motion.a>
                }>{social.label}</FloatPopover>
              </motion.li>)}
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
        <motion.div className="hero-foot center inset-x-0 bottom-0 mt-12 flex flex-col text-neutral-800/80 lg:absolute lg:mt-0 dark:text-neutral-200/80" initial={reduced ? false : { opacity: .0001, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={softBouncePreset}>
          <small className="text-center">{siteConfig.hero.hitokoto}</small>
          <a href="#recent" aria-label="阅读最近更新" className="mt-8 animate-bounce"><i className="i-mingcute-right-line rotate-90 text-2xl" aria-hidden="true" /></a>
        </motion.div>
      </div>
    </div>
  );
}
