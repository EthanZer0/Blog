import { SKIP, visit } from 'unist-util-visit';
import { fromHtml } from 'hast-util-from-html';
import languageMap from './upstream-code-languages.json' with { type: 'json' };

export function rehypeShiro() {
  const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
  return tree => {
    visit(tree, 'element', (node, index, parent) => {
      let props = node.properties ||= {};
      if (props.className?.includes('shiro-container--gallery')) {
        const images = [];
        visit(node, 'element', child => { if (child.tagName === 'img') images.push(child); });
        props.className = 'w-full relative gallery-root'; props.dataGallery = true;
        if (images.length > 1) {
          images.forEach(image => { image.properties.alt = image.properties.title || (/^[¡!]/.test(image.properties.alt || '') ? image.properties.alt.slice(1) : ''); });
          const button = (direction, side, icon) => ({type:'element',tagName:'div',properties:{className:`pointer-events-none absolute inset-y-0 ${side}-2 flex items-center [&_*]:duration-200`,dataGalleryArrow:direction,hidden:direction < 0},children:[{type:'element',tagName:'button',properties:{type:'button',ariaLabel:direction < 0 ? '上一张图片' : '下一张图片',dataGalleryStep:direction,className:'border-border center pointer-events-auto flex size-8 rounded-full border bg-base-100 p-1 opacity-80 hover:opacity-100'},children:[{type:'element',tagName:'i',properties:{className:icon},children:[]}]}]});
          node.children = [{type:'element',tagName:'div',properties:{className:'w-full overflow-auto whitespace-nowrap gallery-container'},children:images.map(image => ({type:'element',tagName:'div',properties:{className:'gallery-child inline-block self-center',style:'width:calc(100% - 60px);margin-right:15px'},children:[image]}))},button(-1,'left','i-mingcute-left-fill'),button(1,'right','i-mingcute-right-fill'),{type:'element',tagName:'div',properties:{className:'gallery-indicator space-x-2'},children:images.map((_,index) => ({type:'element',tagName:'button',properties:{type:'button',ariaLabel:`查看第 ${index+1} 张图片`,dataGalleryIndex:index,className:'size-[6px] cursor-pointer rounded-full bg-stone-600 opacity-50 transition-opacity duration-200 ease-in-out',ariaPressed:index===0},children:[]}))}];
        } else node.children = images;
      }
      if (node.tagName === 'p') props.className = [...(props.className || []), 'paragraph'];
      if (node.tagName === 'table') {
        props.className = ['table', 'table-zebra', 'table-pin-rows'];
        if (parent) parent.children[index] = { type:'element', tagName:'div', properties:{className:'w-full min-w-0 overflow-auto'}, children:[node] };
      }
      if (node.tagName === 'p' && parent && node.children.length === 1 && node.children[0].tagName === 'img') {
        parent.children[index] = node.children[0];
        node = parent.children[index];
        props = node.properties ||= {};
      }
      if (node.tagName === 'img' && parent && parent.tagName !== 'span') {
        const caption = props.title || props.alt?.replace(/^[¡!]/, '');
        props.alt = props.alt?.replace(/^[¡!]/, '') || '';
        props.loading = 'lazy';
        props.className = 'max-w-full object-cover duration-200';
        props.style = 'max-height:100vh;max-width:100%';
        parent.children[index] = { type:'element',tagName:'figure',properties:{},children:[
          {type:'element',tagName:'span',properties:{className:'group/image relative flex justify-center overflow-hidden rounded-xl'},children:[node]},
          ...(caption ? [{type:'element',tagName:'figcaption',properties:{className:'mt-1 flex flex-col items-center justify-center'},children:[{type:'element',tagName:'hr',properties:{className:'my-4 h-[0.5px] w-[80px] border-0 bg-black/30 opacity-80 dark:bg-white/30'},children:[]},{type:'element',tagName:'span',properties:{},children:[{type:'text',value:caption}]}]}] : []),
        ]};
      }
      if (props.dataFootnotes) {
        node.tagName = 'div'; props.id = 'md-footnote'; props.className = 'mt-4';
        node.children = node.children.filter(child => child.tagName !== 'h2');
        node.children.unshift({type:'element',tagName:'hr',properties:{className:'my-4 h-[0.5px] border-0 bg-black/30 dark:bg-white/30'},children:[]});
        const list = node.children.find(child => child.tagName === 'ol');
        if (list) { list.tagName = 'ul'; list.properties.className = 'list-[upper-roman] space-y-3 text-base text-zinc-600 dark:text-neutral-400'; }
      }
      if (props.dataFootnoteRef) props.ariaDescribedBy = 'md-footnote';
      if (props.dataFootnoteBackref) {
        props.className = 'ml-2 inline-flex items-center';
        node.children = [{type:'element',tagName:'svg',properties:{width:'1em',height:'1em',viewBox:'0 0 24 24',ariaHidden:true},children:[{type:'element',tagName:'path',properties:{fill:'currentColor',d:'m6.8 13l2.9 2.9q.275.275.275.7t-.275.7q-.275.275-.7.275t-.7-.275l-4.6-4.6q-.15-.15-.213-.325T3.426 12q0-.2.063-.375T3.7 11.3l4.6-4.6q.275-.275.7-.275t.7.275q.275.275.275.7t-.275.7L6.8 11H19V8q0-.425.288-.713T20 7q.425 0 .713.288T21 8v3q0 .825-.588 1.413T19 13H6.8Z'},children:[]}]}];
      }
      if (node.tagName === 'a' && !props.dataFootnoteRef && !props.dataFootnoteBackref && !props.className?.includes('heading-anchor')) props.className = 'shiro-link--underline';
      const fencedCode = node.tagName === 'pre' && node.children.find(child => child.tagName === 'code');
      const languageClass = fencedCode?.properties?.className?.find(name => name.startsWith('language-'));
      const language = props.dataLanguage || languageClass?.slice(9);
      if (node.tagName === 'pre' && language && parent) {
        props.className = [...(props.className || []), 'shiki'];
        const filename = (props.dataCodeMeta || fencedCode.data?.meta || node.data?.meta || '').match(/filename="([^"]+)"/)?.[1];
        const info = languageMap[language];
        const icon = info ? fromHtml(info.svg,{fragment:true}).children[0] : {type:'text',value:language.toUpperCase()};
        const header = filename ? {type:'element',tagName:'div',properties:{className:'z-10 flex w-full items-center justify-between rounded-t-xl bg-accent/20 px-5 py-2 text-sm',style:info ? `background-color:${info.color}33` : ''},children:[{type:'element',tagName:'span',properties:{className:'shrink-0 grow truncate'},children:[{type:'text',value:filename}]},{type:'element',tagName:'span',properties:{className:'pointer-events-none flex shrink-0 grow-0 items-center gap-1',ariaHidden:true},children:[icon]}]} : {type:'element',tagName:'div',properties:{className:'pointer-events-none absolute bottom-3 right-3 z-[2] text-sm opacity-60',ariaHidden:true},children:[icon]};
        const expanded = props.dataCodeMeta?.includes('expand'); delete props.dataCodeMeta;
        parent.children[index] = { type:'element',tagName:'div',properties:{className:'shiki-code-card shiki-block group',dataShiroCode:true,dataCodeColor:info?.color,dataCodeFilename:filename,dataCodeExpand:expanded || undefined},children:[header,{type:'element',tagName:'div',properties:{className:'bg-accent/5 py-4',style:info ? `background-color:${info.color}0d` : ''},children:[{type:'element',tagName:'div',properties:{className:'relative max-h-[50vh] w-full overflow-auto shiki-scroll-container',style:`--sr-margin:${filename ? '1rem' : `${language.length*14+4}px`}`,dataCodeScroll:true},children:[node]}]}]};
      }
      if (props.dataBannerType) {
        const type = props.dataBannerType;
        const colors = { info: 'bg-blue-50 dark:bg-blue-300/10 border-blue-300', warning: 'bg-amber-50 dark:bg-amber-300/10 border-amber-300', error: 'bg-red-50 dark:bg-red-300/10 border-red-300', success: 'bg-green-50 dark:bg-green-300/10 border-green-300' };
        const icons = {
          info: ['0 0 256 256', 'M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88a88.1 88.1 0 0 1-88 88Zm16-40a8 8 0 0 1-8 8a16 16 0 0 1-16-16v-40a8 8 0 0 1 0-16a16 16 0 0 1 16 16v40a8 8 0 0 1 8 8Zm-32-92a12 12 0 1 1 12 12a12 12 0 0 1-12-12Z', 'text-blue-500'],
          warning: ['0 0 28 28', 'M14 10.55a.75.75 0 0 1 .75.75v5a.75.75 0 0 1-1.5 0v-5a.75.75 0 0 1 .75-.75Zm0 10a1 1 0 1 0 0-2a1 1 0 0 0 0 2ZM12.039 5.207c.86-1.53 3.062-1.53 3.922 0l8.685 15.44c.844 1.5-.24 3.353-1.96 3.353H5.314c-1.721 0-2.805-1.853-1.961-3.353l8.685-15.44Zm2.615.735a.75.75 0 0 0-1.308 0l-8.685 15.44a.75.75 0 0 0 .654 1.118h17.37a.75.75 0 0 0 .654-1.118l-8.685-15.44Z', 'text-amber-500'],
          error: ['0 0 20 20', 'M10 6a.5.5 0 0 1 .5.5v5a.5.5 0 0 1-1 0v-5A.5.5 0 0 1 10 6Zm0 8.5a.75.75 0 1 0 0-1.5a.75.75 0 0 0 0 1.5ZM9.723 2.084a.5.5 0 0 1 .554 0a15.05 15.05 0 0 0 6.294 2.421A.5.5 0 0 1 17 5v4.5c0 3.891-2.307 6.73-6.82 8.467a.5.5 0 0 1-.36 0C5.308 16.23 3 13.39 3 9.5V5a.5.5 0 0 1 .43-.495a15.05 15.05 0 0 0 6.293-2.421Zm-.124 1.262A15.969 15.969 0 0 1 4 5.428V9.5c0 3.392 1.968 5.863 6 7.463c4.032-1.6 6-4.071 6-7.463V5.428a15.969 15.969 0 0 1-5.6-2.082l-.4-.249l-.4.249Z', 'text-red-500'],
          success: ['0 0 36 36', 'M13.72 27.69L3.29 17.27a1 1 0 0 1 1.41-1.41l9 9L31.29 7.29A1 1 0 0 1 32.7 8.7Z', 'text-green-500'],
        };
        const [viewBox,d,color] = icons[type];
        props.className = `my-4 flex flex-col items-center gap-4 rounded-md border p-6 text-neutral-900 dark:text-[#c4c4c4] md:flex-row justify-center ${colors[type]}`;
        node.children = [{ type:'element', tagName:'svg', properties:{ viewBox, width:'1em', height:'1em', ariaHidden:true, className:`shrink-0 text-3xl md:mr-2 md:self-start md:text-left ${color}` }, children:[{type:'element',tagName:'path',properties:{fill:'currentColor',d},children:[]}] },{type:'element',tagName:'div',properties:{className:'w-full [&>p:first-child]:mt-0'},children:node.children}];
        delete props.dataBannerType;
      }
      for (const key of ['href', 'src']) {
        const value = props[key];
        if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) props[key] = `${base}${value}`;
      }
      if (/^h[1-6]$/.test(node.tagName) && props.id) {
        if(props.id === 'footnote-label') return;
        props.className = 'group flex items-center'; props.dataMarkdownHeading = true;
        node.children = [{type:'element',tagName:'span',properties:{},children:node.children},{type:'element',tagName:'a',properties:{href:`#${props.id}`,className:'heading-anchor center ml-2 inline-flex cursor-pointer select-none text-accent opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100',ariaLabel:'此标题的链接',dataPagefindIgnore:true},children:[{type:'element',tagName:'i',properties:{className:'i-mingcute-hashtag-line'},children:[]}]}];
      }
      if (node.tagName === 'img') return SKIP;
    });
  };
}
