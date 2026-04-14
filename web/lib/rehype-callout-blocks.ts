/**
 * rehype-callout-blocks
 *
 * Detects emoji-prefixed blockquotes written by lesson authors:
 *   > **💡 Tip:** ...
 *   > **⚠️ Warning:** ...
 *   > **🚨 Important:** ...
 *   > **🔬 Research Question:** ...
 *   > **🏆 Challenge:** ...
 *
 * Stamps a `data-callout` attribute on the <blockquote> element so CSS can
 * apply per-type colour without needing MDX component syntax in content files.
 */

import { visit } from 'unist-util-visit';
import type { Root, Element, Text } from 'hast';

const EMOJI_TYPE_MAP: Array<[string, string]> = [
  ['💡', 'tip'],
  ['⚠️', 'warning'],
  ['🚨', 'danger'],
  ['🔬', 'research'],
  ['🏆', 'challenge'],
];

function getTextContent(node: Element): string {
  let text = '';
  for (const child of node.children) {
    if (child.type === 'text') {
      text += (child as Text).value;
    } else if (child.type === 'element') {
      text += getTextContent(child as Element);
    }
  }
  return text;
}

export default function rehypeCalloutBlocks() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      const el = node as Element;
      if (el.tagName !== 'blockquote') return;

      // Find first <p> child (skip whitespace text nodes)
      const firstP = el.children.find(
        (c): c is Element => c.type === 'element' && (c as Element).tagName === 'p',
      );
      if (!firstP) return;

      // Find first <strong> inside that <p>
      const firstStrong = firstP.children.find(
        (c): c is Element => c.type === 'element' && (c as Element).tagName === 'strong',
      );
      if (!firstStrong) return;

      const strongText = getTextContent(firstStrong).trim();

      for (const [emoji, type] of EMOJI_TYPE_MAP) {
        if (strongText.startsWith(emoji)) {
          if (!el.properties) el.properties = {};
          el.properties['dataCallout'] = type;
          return;
        }
      }
    });
  };
}
