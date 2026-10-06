import { visit } from 'unist-util-visit';
import { createHighlighter, bundledLanguages } from 'shiki';
import { transformerNotationDiff, transformerNotationHighlight, transformerNotationWordHighlight, transformerMetaHighlight } from '@shikijs/transformers';
let highlighter;
// The pinned upstream Shiki 3.21.0 engine and core.ts transformer settings.
export function rehypeShiroHighlight() {
  return async tree => {
    highlighter ||= createHighlighter({ themes:['github-light','github-dark'], langs:[] });
    const engine = await highlighter;
    const blocks = [];
    visit(tree,'element',(node,index,parent) => {
      if (node.tagName !== 'pre' || !parent) return;
      const code = node.children.find(child => child.tagName === 'code');
      if (code) blocks.push({node,index,parent,code});
    });
    for (const {index,parent,code} of blocks) {
      const requested = code.properties?.className?.find(name => name.startsWith('language-'))?.slice(9) || 'plaintext';
      if (code.properties?.className?.some(name => name === 'math-display' || name === 'math-inline')) continue;
      const language = bundledLanguages[requested] ? requested : 'plaintext';
      if (bundledLanguages[language] && !engine.getLoadedLanguages().includes(language)) await engine.loadLanguage(language);
      const content = code.children.map(child => child.value || '').join('');
      const meta = code.data?.meta || '';
      const result = engine.codeToHast(content,{lang:language,meta:{__raw:meta},themes:{light:'github-light',dark:'github-dark'},transformers:[transformerNotationDiff({matchAlgorithm:'v3'}),transformerNotationHighlight({matchAlgorithm:'v3'}),transformerNotationWordHighlight({matchAlgorithm:'v3'}),transformerMetaHighlight()]});
      const pre = result.children[0];
      pre.properties.dataLanguage = requested;
      pre.properties.dataCodeMeta = meta;
      parent.children[index] = pre;
    }
  };
}
