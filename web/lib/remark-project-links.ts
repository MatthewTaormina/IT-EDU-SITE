/**
 * remark-project-links
 *
 * Rewrites relative .md links in project documents to their Next.js route.
 * e.g. ./01_brief.md  →  /projects/webdev_capstone_portfolio/01_brief
 *
 * Usage: remarkProjectLinks({ projectSlug: 'webdev_capstone_portfolio' })
 */
import { visit } from 'unist-util-visit';
import type { Root, Link } from 'mdast';
import type { Plugin } from 'unified';

interface Options {
  projectSlug: string;
}

const remarkProjectLinks: Plugin<[Options], Root> = ({ projectSlug }) => {
  return (tree: Root) => {
    visit(tree, 'link', (node: Link) => {
      const href = node.url;
      // Match ./filename.md or filename.md (relative, no leading /)
      if (/^\.?\.?\/[^/]+\.md$/.test(href) || /^[^/][^:]*\.md$/.test(href)) {
        const docSlug = href
          .replace(/^\.\//, '')   // strip ./
          .replace(/\.md$/, '');  // strip .md extension
        node.url = `/projects/${projectSlug}/${docSlug}`;
      }
    });
  };
};

export default remarkProjectLinks;
