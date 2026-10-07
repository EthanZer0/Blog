import {Divider} from './upstream/adapters';
import {FloatPopover} from './FloatPopover';
import {toast} from 'sonner';
const strings={"outdated_prefix":"这篇文章上次修改于","outdated_suffix":"，可能部分内容已经不适用，如有疑问可询问作者。","category_prefix":"分类 - ","category_count_prefix":"当前共有","category_count_suffix":"篇文章，加油！","category_empty":"这里还有没有内容呢，再接再厉！","timeline_total":"共有","timeline_posts":"篇文章，","timeline_keep_going":"再接再厉","timeline_look_back":"回顾一下从前吧","page_title":"文章列表","tag_title":"标签：{name} ({count})","redirecting":"正在重定向到","related_before":"阅读此文章之前，你可能需要首先阅读以下的文章才能更好的理解上下文。","related_after":"关联阅读","recent_posts":"最近更新的文稿","recent_notes":"最近更新的手记","more":"还有更多","view_article":"查看文章","details":"详情","copyright_title":"文章标题：","copyright_author":"文章作者：","copyright_link":"文章链接：","copyright_copy":"[复制]","copyright_modified":"最后修改时间：","copyright_license_text":"商业转载请联系站长获得授权，非商业转载请注明本文出处及文章链接，您可以自由地在任何媒体以任何形式复制和分发作品，也可以修改和创作，但是分发衍生作品时必须采用相同的许可协议。","copyright_license_prefix":"本文采用","copyright_license_suffix":"进行许可。","copyright_license_tooltip":"知识共享署名-非商业性使用-相同方式共享 4.0 国际许可协议","copyright_license_link_text":"CC BY-NC-SA 4.0 - 非商业性使用 - 相同方式共享 4.0 国际"};
const t=(key:keyof typeof strings)=>strings[key];
const common={"copy_article_link":"已复制文章链接","no_modification":"暂没有修改过"};
const tCommon=(key:keyof typeof common)=>common[key];
export default function PostCopyright({title,link,date,name,license}:{title:string;link:string;date?:string;name:string;license:string}){
const format={dateTime:(value:Date,options:Intl.DateTimeFormatOptions)=>new Intl.DateTimeFormat('zh-CN',options).format(value)};
  return (
    <section
      className="mt-4 text-sm leading-loose text-zinc-600 dark:text-neutral-400"
      id="copyright"
    >
      <p>
        {t('copyright_title')}
        {title}
      </p>
      <p>
        {t('copyright_author')}
        {name}
      </p>
      <p>
        {t('copyright_link')}
        <span>{link}</span>{' '}
        <a
          onClick={async () => {
            try { await navigator.clipboard.writeText(link); toast.success(tCommon('copy_article_link')); }
            catch { toast.error('复制失败，请检查浏览器的剪贴板权限。'); }
          }}
          data-hide-print
          className="cursor-pointer select-none"
        >
          {t('copyright_copy')}
        </a>
      </p>
      <p>
        {t('copyright_modified')}{' '}
        {date
          ? format.dateTime(new Date(date), {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
            })
          : tCommon('no_modification')}
      </p>
      <Divider />
      <div>
        <p>
          {license==='reserved'?'转载请注明作者与文章出处。':t('copyright_license_text')}
          <br />
          {license!=='reserved'&&<>{t('copyright_license_prefix')}{' '}
          <FloatPopover
            asChild
            mobileAsSheet
            type="tooltip"
            triggerElement={
              <a
                className="shiro-link--underline"
                href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
                target="_blank"
                rel="noreferrer"
              >
                CC BY-NC-SA 4.0 - 非商业性使用 - 相同方式共享 4.0 国际
              </a>
            }
          >
            {t('copyright_license_tooltip')}
          </FloatPopover>
          {t('copyright_license_suffix')}</>}
        </p>
      </div>
    </section>
  )
}
