// Static navigation subset of (home)/Windsock; like/subscribe were explicitly omitted.
import { motion } from 'motion/react';
import { siteConfig } from '../site.config';
import { withBase } from '../lib/url';
import '../styles/home-year-timeline.css';

export default function Windsock({ latestNotePath }: { latestNotePath: string }) {
  const items = siteConfig.nav.slice(1).map(item =>
    item.title === '手记' ? { ...item, path: latestNotePath } : item,
  );
  return (
    <section className="home-windsock center mt-28 flex flex-col" aria-label="去到别处看看？">
      <h2 className="home-section-heading">去到别处看看？</h2>
      <ul className="mt-16 flex flex-col flex-wrap gap-2 gap-y-8 lg:flex-row">
        {items.map((item, index) => (
          <motion.li key={item.path}
            initial={{ opacity: .0001, y: 10 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0, transition: { stiffness: 641, damping: 23, mass: 3.9, type: 'spring', delay: index * .05 } }}
            transition={{ delay: .001 }}
            className="flex items-center justify-between text-sm"
          >
            <a href={withBase(item.path)} className="windsock-link">
              {item.title}
            </a>
            {index !== items.length - 1 && <span className="mx-4 hidden select-none lg:inline"> · </span>}
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
