import { visit } from 'unist-util-visit';

export function rehypeShiro() {
  const base = (process.env.BASE_PATH || '/').replace(/\/$/, '');
  return tree => {
    visit(tree, 'element', (node, index, parent) => {
      const props = node.properties ||= {};
      if (node.tagName === 'p') props.className = [...(props.className || []), 'paragraph'];
      if (node.tagName === 'table') props.className = ['table', 'table-zebra', 'table-pin-rows'];
      const fencedCode = node.tagName === 'pre' && node.children.find(child => child.tagName === 'code');
      const languageClass = fencedCode?.properties?.className?.find(name => name.startsWith('language-'));
      const language = props.dataLanguage || languageClass?.slice(9);
      if (node.tagName === 'pre' && language && parent) {
        props.className = [...(props.className || []), 'shiki'];
        parent.children[index] = { type:'element', tagName:'div', properties:{className:'shiki-code-card shiki-block group',dataShiroCode:true}, children:[
          {type:'element',tagName:'div',properties:{className:'pointer-events-none absolute bottom-3 right-3 z-[2] text-sm opacity-60',ariaHidden:true},children:[{type:'text',value:language.toUpperCase()}]},
          {type:'element',tagName:'div',properties:{className:'bg-accent/5 py-4'},children:[node]},
        ] };
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
        node.children.push({ type: 'element', tagName: 'a', properties: { href: `#${props.id}`, className: ['heading-anchor'], ariaLabel: '此标题的链接', dataPagefindIgnore: true }, children: [] });
      }
    });
  };
}
