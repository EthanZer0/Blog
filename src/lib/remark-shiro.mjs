import { visit } from 'unist-util-visit';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
const parser=unified().use(remarkParse);
export function shiroHtmlBlocks(){
 const parse=this.parser;
 this.parser=(value,file)=>parse(value.replace(/^:::\s*(grid|masonry|banner|gallery|carousel)\s*(?:\{([^}]+)\})?\s*$/gm,(_,name,params)=>{
 const attrs=params?(name==='banner'?`type="${params.trim()}"`:params.split(',').map(part=>part.trim().replace(/=([^"'\s]+)$/, '="$1"')).join(' ')):'';
 return `:::${name}${attrs?'{'+attrs+'}':''}`;
 }),file);
 return tree=>{
  visit(tree,'html',(node,index,parent)=>{if(!parent||!/^<Tabs[\s>]/i.test(node.value))return;const tabs=[...node.value.matchAll(/<tab\s+label=["']([^"']+)["'][^>]*>([\s\S]*?)<\/tab>/gi)];if(!tabs.length)return;parent.children[index]={type:'containerDirective',name:'tabs',attributes:{},children:tabs.map(([,label,body])=>({type:'containerDirective',name:'tab',attributes:{label},children:parser.parse(body.trim()).children}))};});
  visit(tree,'text',(node,index,parent)=>{if(!parent)return;const parts=node.value.split(/(\|\|[\s\S]+?\|\|)/);if(parts.length===1)return;parent.children.splice(index,1,...parts.filter(Boolean).map(value=>value.startsWith('||')?{type:'textDirective',name:'spoiler',attributes:{},children:parser.parse(value.slice(2,-2)).children[0]?.children||[]}: {type:'text',value}));});
};}

// Initial supported subset: containers with ordinary Markdown children.
// Fail during authoring for unsupported names rather than silently losing content.
export function shiroDirectives() {
  return (tree, file) => {
    visit(tree, (node) => {
      if (!['containerDirective', 'leafDirective', 'textDirective'].includes(node.type)) return;
      const supported = ['note', 'tip', 'warning', 'warn', 'danger', 'error', 'success', 'info', 'gallery','carousel','banner','grid','masonry','tabs','tab','spoiler','tag','linkcard'];
      if (!supported.includes(node.name)) file.fail(`Unsupported Shiro directive: ${node.name}`, node);
      const data = node.data ||= {};
      data.hName = 'div';
      data.hProperties = { className: ['shiro-container', `shiro-container--${node.name}`] };
      const attrs=node.attributes||{};
      if(['note','tip','warning','warn','danger','error','success','info','banner'].includes(node.name)) data.hProperties.dataBannerType = ({warn:'warning',note:'info',tip:'success',danger:'error'})[node.name] || (node.name==='banner'?attrs.type||'info':node.name);
      else if(node.name==='grid'){if(attrs.type==='images'){data.hProperties.dataGridImages=true;data.hProperties.dataRatio=attrs.rows&&attrs.cols?Number(attrs.rows)/Number(attrs.cols):1;}data.hProperties.style=`grid-template-columns:repeat(${Number(attrs.cols)||1},minmax(0,1fr));gap:${Number(attrs.gap)||8}px;${attrs.rows?`grid-template-rows:repeat(${Number(attrs.rows)},minmax(0,1fr));`:''}`;}
      else if(node.name==='masonry'){data.hProperties.dataMasonry=true;data.hProperties.dataGap=attrs.gap||8;data.hProperties.style=`column-gap:${Number(attrs.gap)||8}px`;}
      else if(node.name==='tab')data.hProperties.dataTabLabel=attrs.label||'Tab';
      else if(node.name==='linkcard')Object.assign(data.hProperties,{dataLinkCard:true,dataHref:attrs.href||attrs.url,dataTitle:attrs.title,dataDescription:attrs.description,dataImage:attrs.image});
    });
  };
}
