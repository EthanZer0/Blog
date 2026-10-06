import { visit } from 'unist-util-visit';

// Initial supported subset: containers with ordinary Markdown children.
// Fail during authoring for unsupported names rather than silently losing content.
export function shiroDirectives() {
  return (tree, file) => {
    visit(tree, (node) => {
      if (!['containerDirective', 'leafDirective', 'textDirective'].includes(node.type)) return;
      const supported = ['note', 'tip', 'warning', 'warn', 'danger', 'error', 'success', 'info', 'gallery'];
      if (!supported.includes(node.name)) file.fail(`Unsupported Shiro directive: ${node.name}`, node);
      const data = node.data ||= {};
      data.hName = 'div';
      data.hProperties = { className: ['shiro-container', `shiro-container--${node.name}`] };
      if(node.name !== 'gallery') data.hProperties.dataBannerType = ({warn:'warning',note:'info',tip:'success',danger:'error'})[node.name] || node.name;
    });
  };
}
