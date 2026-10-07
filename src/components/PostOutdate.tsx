// Original PostOutdate: modified posts older than 60 full days, original Banner.
import { useEffect, useState } from 'react';
import { Banner } from './upstream/Banner';
export default function PostOutdate({ modified }: { modified: string }) {
  const [outdated, setOutdated] = useState(false);
  useEffect(() => { setOutdated(Math.trunc((Date.now() - new Date(modified).getTime()) / 86400000) > 60); }, [modified]);
  if (!outdated) return null;
  return <Banner className="my-10" type="warning"><span className="leading-[1.8]">这篇文章上次修改于<time dateTime={modified}>{new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', timeZone: 'Asia/Shanghai' }).format(new Date(modified))}</time>，可能部分内容已经不适用，如有疑问可询问作者。</span></Banner>;
}
