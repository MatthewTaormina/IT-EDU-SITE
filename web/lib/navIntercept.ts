/**
 * Navigation intercept script builder — shared by the Edge middleware
 * (middleware.ts) and the BrowserApp client component.
 *
 * The generated script is injected into every iframed HTML document to
 * intercept anchor-click events in capture phase and forward the destination
 * URL to the parent BrowserApp via postMessage so in-app navigation history
 * and the URL bar stay in sync.
 *
 * Why embed BASE instead of relying on `a.href` / `<base href>`?
 * ──────────────────────────────────────────────────────────────
 * `a.href` (a resolved, absolute URL) is derived from the document's active
 * `<base>` tag. The middleware injects `<base href="[originalUrl]">` so that
 * relative asset URLs resolve correctly. However, CSR frameworks (React,
 * Next.js, Vue, …) mutate `<head>` during client-side hydration — they can
 * remove or replace `<base>` with a relative value. After hydration, `a.href`
 * would resolve against the iframe's actual origin (the proxy endpoint) rather
 * than the external site, causing every subsequent navigation hop to be blocked
 * or to error.
 *
 * Embedding the original URL as `BASE` inside the script and using
 * `new URL(raw, BASE)` makes URL resolution completely independent of the
 * document's `<base>` tag.
 *
 * Same-page fragment links
 * ────────────────────────
 * After resolving `href`, the script compares the resolved URL's `origin` and
 * `pathname` against `BASE`. If they match — meaning the link targets the same
 * page with only a different hash (e.g. `href="/page#section"` on `/page`) —
 * the intercept posts a `browser-hashchange` message to the parent (so the URL
 * bar can be updated) and then returns early, letting the browser handle the
 * anchor scroll natively. Without this, such links would trigger a full
 * `browser-navigate` message and reload the iframe instead of scrolling.
 *
 * Injection safety
 * ────────────────
 * `JSON.stringify` is used to serialise the URL into a JS string literal.
 * It correctly escapes backslashes, double-quotes, and all control characters.
 * The additional replacements convert `<`, `>`, and `&` to Unicode escapes so
 * that sequences like `</script>` inside the URL cannot terminate the enclosing
 * `<script>` tag in the HTML parser, even in quirks-mode documents.
 */

/**
 * Returns a self-executing script string that intercepts anchor clicks and
 * resolves relative hrefs against `pageUrl` via `new URL(raw, BASE)`.
 *
 * `window.name` is expected to hold the BrowserApp `windowId`; the parent
 * message listener uses it to ignore events from unrelated windows.
 */
export function buildNavInterceptScript(pageUrl: string): string {
  // JSON.stringify handles backslashes, quotes, and control characters.
  // The additional replacements prevent </script> sequences in the URL from
  // prematurely ending the enclosing <script> tag in the HTML parser.
  const safe = JSON.stringify(pageUrl)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

  return (
    "(function(){var BASE=" + safe + ";" +
    "document.addEventListener('click',function(e){" +
    "var a=e.target.closest('a[href]');if(!a)return;" +
    "var raw=a.getAttribute('href');if(!raw||raw.charAt(0)==='#')return;" +
    "var href;try{href=new URL(raw,BASE).href;}catch(x){href=raw;}" +
    "if(/^javascript:/i.test(href))return;" +
    // Same-page fragment: let the browser scroll natively, but tell the parent
    // about the new hash so it can update the URL bar.
    "try{var b=new URL(BASE),d=new URL(href);" +
    "if(d.origin===b.origin&&d.pathname===b.pathname){" +
    "window.parent.postMessage({type:'browser-hashchange',href:href,windowId:window.name},'*');" +
    "return;}}catch(x){}" +
    "e.preventDefault();" +
    "window.parent.postMessage({type:'browser-navigate',href:href,windowId:window.name},'*');" +
    "},true);})();"
  );
}

/**
 * Injects the nav intercept script into an HTML string.
 * The script is placed immediately before `</head>` (or prepended if no
 * `</head>` is present, e.g. in partial HTML fragments).
 */
export function injectNavScript(html: string, pageUrl: string): string {
  const tag = `<script>${buildNavInterceptScript(pageUrl)}</script>`;
  const idx = html.indexOf('</head>');
  if (idx !== -1) return html.slice(0, idx) + tag + html.slice(idx);
  return tag + html;
}
