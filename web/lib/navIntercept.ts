/**
 * Navigation intercept script builder — shared by the Edge middleware
 * (middleware.ts) and the BrowserApp client component.
 *
 * The generated script is injected into every iframed HTML document to
 * intercept anchor-click events, form submissions, and network requests
 * (fetch / XMLHttpRequest), forwarding them through the parent BrowserApp
 * or our server-side proxy so the sandboxed page behaves like a real browser
 * tab opened to the original URL.
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
 * When a resolved link has the same origin+pathname as BASE but a different
 * hash, the intercept calls `preventDefault()` and scrolls to the target
 * element (or updates `location.hash`) instead of posting a navigate message.
 * This avoids a full page reload and the cross-origin "refused to connect"
 * error that occurs when the `<base>` tag causes the browser to resolve the
 * link against the external origin.
 *
 * Form submissions
 * ────────────────
 * A capture-phase `submit` listener intercepts form submissions:
 *   • GET forms: the action + serialised form data are sent as a
 *     `browser-navigate` message (same as a link click).
 *   • POST/PUT/etc. forms: a `browser-form-submit` message carries the
 *     action URL, method, and URL-encoded body to the parent BrowserApp,
 *     which forwards the request through the server-side proxy.
 *
 * fetch / XMLHttpRequest intercepts
 * ──────────────────────────────────
 * When the iframe runs on the same origin as the parent (proxied external
 * pages with `allow-same-origin`), `window.fetch` and
 * `XMLHttpRequest.prototype.open` are monkey-patched:
 *   • Relative URLs are resolved against BASE (not the iframe's actual
 *     origin) so they point at the correct external server.
 *   • Absolute URLs whose origin differs from the iframe's actual origin
 *     are rewritten to go through `/api/browser-proxy?url=…&_raw=1` so
 *     that CORS restrictions do not block them. The `_raw=1` flag tells
 *     the proxy to skip HTML body processing (no base-tag / nav-script
 *     injection) so JSON, XML, and binary responses pass through intact.
 *   • URLs that already target the iframe's own origin are left untouched
 *     to prevent double-proxying.
 *
 * JavaScript redirect intercepts
 * ──────────────────────────────
 * Bot-detection challenge pages frequently redirect via JS after setting a
 * cookie (`location.href = '...'`, `location.assign(url)`,
 * `location.replace(url)`). Without interception, these navigate the iframe
 * directly to the external URL — which fails because the remote server
 * blocks framing.
 *
 * The script overrides `Location.prototype.href` (setter),
 * `Location.prototype.assign`, and `Location.prototype.replace` to route
 * these navigations through the parent BrowserApp's proxy pipeline.
 *
 * `<meta http-equiv="refresh">` redirect intercept
 * ─────────────────────────────────────────────────
 * Some pages use `<meta http-equiv="refresh" content="0;url=…">` for
 * redirects. A MutationObserver watches `<head>` for these tags and posts
 * a navigation message to the parent before the browser acts on them.
 *
 * Injection safety
 * ────────────────
 * `JSON.stringify` is used to serialise the URL into a JS string literal.
 * It correctly escapes backslashes, double-quotes, and all control characters.
 * The additional replacements convert `<`, `>`, and `&` to Unicode escapes so
 * that sequences like `</script>` inside the URL cannot terminate the enclosing
 * `<script>` tag in the HTML parser, even in quirks-mode documents.
 */

/** Escape a URL for safe embedding inside a `<script>` block as a JS string. */
function safeJsString(url: string): string {
  return JSON.stringify(url)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

/**
 * Returns a self-executing script string that intercepts anchor clicks,
 * form submissions, and fetch/XHR calls, resolving all relative URLs against
 * `pageUrl` via `new URL(raw, BASE)`.
 *
 * `window.name` is expected to hold the BrowserApp `windowId`; the parent
 * message listener uses it to ignore events from unrelated windows.
 */
export function buildNavInterceptScript(pageUrl: string): string {
  const safe = safeJsString(pageUrl);

  // The script is built as a concatenated string so it can be injected
  // directly into <script> tags. Each section is separated by comments
  // for readability in the source; the browser receives one contiguous block.

  // ── Preamble ──────────────────────────────────────────────────────────────
  const preamble =
    '(function(){' +
    'var BASE=' + safe + ';' +
    'var WID=window.name;' +
    'var POST=function(t,d){window.parent.postMessage(Object.assign({windowId:WID},d),"*");};';

  // ── 1. Link click intercept (capture phase) ──────────────────────────────
  const linkIntercept =
    'document.addEventListener("click",function(e){' +
    'var a=e.target&&e.target.closest?e.target.closest("a[href]"):null;if(!a)return;' +
    'var raw=a.getAttribute("href");if(!raw)return;' +
    // Pure #hash — scroll within page (not affected by <base>)
    'if(raw.charAt(0)==="#"){' +
      'e.preventDefault();' +
      'var el=document.getElementById(raw.slice(1));' +
      'if(el){el.scrollIntoView({behavior:"smooth"});}' +
      'else{try{window.location.hash=raw;}catch(x){}}' +
      'return;}' +
    // Resolve relative URL against BASE
    'var href;try{href=new URL(raw,BASE).href;}catch(x){href=raw;}' +
    'if(/^javascript:/i.test(href))return;' +
    // Same-page fragment: origin+pathname match → scroll, don't navigate
    'try{var b=new URL(BASE),d=new URL(href);' +
      'if(d.origin===b.origin&&d.pathname===b.pathname){' +
        'e.preventDefault();' +
        'if(d.hash){var el2=document.getElementById(d.hash.slice(1));' +
          'if(el2){el2.scrollIntoView({behavior:"smooth"});}' +
          'else{try{window.location.hash=d.hash;}catch(x){}}' +
        '}return;}}catch(x){}' +
    'e.preventDefault();' +
    'POST("nav",{type:"browser-navigate",href:href});' +
    '},true);';

  // ── 2. Form submission intercept (capture phase) ─────────────────────────
  const formIntercept =
    'document.addEventListener("submit",function(e){' +
    'var f=e.target;if(!f||!f.tagName||f.tagName!=="FORM")return;' +
    'e.preventDefault();' +
    // Resolve action against BASE; default to BASE if empty
    'var action=f.getAttribute("action")||"";' +
    'var method=(f.method||f.getAttribute("method")||"GET").toUpperCase();' +
    'var href;try{href=new URL(action,BASE).href;}catch(x){href=action||BASE;}' +
    // Respect formaction/formmethod on the submitter button
    'if(e.submitter){' +
      'var fa=e.submitter.getAttribute("formaction");' +
      'if(fa){try{href=new URL(fa,BASE).href;}catch(x){href=fa;}}' +
      'var fm=e.submitter.getAttribute("formmethod");' +
      'if(fm)method=fm.toUpperCase();' +
    '}' +
    'if(method==="GET"){' +
      // GET form: build URL with query params, navigate
      'try{var u=new URL(href);' +
        'var fd=new FormData(f);' +
        'var sp=new URLSearchParams(fd);' +
        'u.search=sp.toString();' +
        'POST("nav",{type:"browser-navigate",href:u.href});' +
      '}catch(x){POST("nav",{type:"browser-navigate",href:href});}' +
    '}else{' +
      // POST/PUT/etc: serialise body, send to parent for proxying
      'var fd2=new FormData(f);' +
      'var body=new URLSearchParams(fd2).toString();' +
      'POST("form",{type:"browser-form-submit",href:href,method:method,' +
        'body:body,contentType:"application/x-www-form-urlencoded"});' +
    '}' +
    '},true);';

  // ── 3. fetch() and XMLHttpRequest intercepts ─────────────────────────────
  // Only install when the iframe shares origin with the parent (proxied
  // external pages with allow-same-origin). In opaque-origin srcdoc iframes
  // (local:// pages) network requests to our origin would be cross-origin
  // and fail regardless, so we skip the intercept.
  const fetchIntercept =
    'if(typeof window.location.origin==="string"&&window.location.origin!=="null"){' +
    // Helper: rewrite a URL through the proxy if it targets an external origin
    'var SELF=window.location.origin;' +
    'var PROXY=SELF+"/api/browser-proxy";' +
    'function rewrite(raw){' +
      'var abs;try{abs=new URL(raw,BASE).href;}catch(x){return raw;}' +
      'try{var p=new URL(abs);' +
        // Non-http(s) schemes (data:, blob:, etc.) — leave alone
        'if(p.protocol!=="http:"&&p.protocol!=="https:")return raw;' +
        // Already targeting our own origin — don't double-proxy
        'if(p.origin===SELF)return raw;' +
      '}catch(x){return raw;}' +
      'return PROXY+"?url="+encodeURIComponent(abs)+"&_raw=1";' +
    '}' +

    // ── fetch() override ────────────────────────────────────────────────
    'var _fetch=window.fetch;' +
    'window.fetch=function(input,init){' +
      'if(typeof input==="string"){' +
        'return _fetch.call(this,rewrite(input),init);' +
      '}' +
      'if(typeof URL!=="undefined"&&input instanceof URL){' +
        'return _fetch.call(this,rewrite(input.href),init);' +
      '}' +
      'if(typeof Request!=="undefined"&&input instanceof Request){' +
        'var nurl=rewrite(input.url);' +
        'if(nurl!==input.url){' +
          'var nr=new Request(nurl,input);' +
          'return _fetch.call(this,nr,init);' +
        '}' +
      '}' +
      'return _fetch.apply(this,arguments);' +
    '};' +

    // ── XMLHttpRequest.open override ────────────────────────────────────
    'var _xhrOpen=XMLHttpRequest.prototype.open;' +
    'XMLHttpRequest.prototype.open=function(){' +
      'if(arguments.length>=2&&typeof arguments[1]==="string"){' +
        'arguments[1]=rewrite(arguments[1]);' +
      '}' +
      'return _xhrOpen.apply(this,arguments);' +
    '};' +

    '}'; // end if(origin !== "null")

  // ── 4. JavaScript redirect intercepts ────────────────────────────────────
  // Override Location.prototype methods so that JS-driven redirects
  // (location.href = '…', location.assign(), location.replace()) post a
  // navigation message to the parent instead of navigating the iframe
  // directly to the external URL.
  const locationIntercept =
    '(function(){' +
    'function resolve(raw){' +
      'try{return new URL(raw,BASE).href;}catch(x){return raw;}' +
    '}' +

    // ── location.assign() ───────────────────────────────────────────────
    'var _assign=Location.prototype.assign;' +
    'Location.prototype.assign=function(url){' +
      'var abs=resolve(url);' +
      'if(/^https?:/i.test(abs)){POST("nav",{type:"browser-navigate",href:abs});return;}' +
      '_assign.call(this,url);' +
    '};' +

    // ── location.replace() ──────────────────────────────────────────────
    'var _replace=Location.prototype.replace;' +
    'Location.prototype.replace=function(url){' +
      'var abs=resolve(url);' +
      'if(/^https?:/i.test(abs)){POST("nav",{type:"browser-navigate",href:abs});return;}' +
      '_replace.call(this,url);' +
    '};' +

    // ── location.href setter ────────────────────────────────────────────
    'try{' +
      'var desc=Object.getOwnPropertyDescriptor(Location.prototype,"href");' +
      'if(desc&&desc.set){' +
        'var _hrefSet=desc.set;' +
        'Object.defineProperty(Location.prototype,"href",{' +
          'get:desc.get,' +
          'set:function(url){' +
            'var abs=resolve(url);' +
            'if(/^https?:/i.test(abs)){POST("nav",{type:"browser-navigate",href:abs});return;}' +
            '_hrefSet.call(this,url);' +
          '},' +
          'configurable:true,enumerable:true' +
        '});' +
      '}' +
    '}catch(x){}' +

    '})();';

  // ── 5. Meta refresh redirect intercept ───────────────────────────────────
  // Watch for <meta http-equiv="refresh" content="N;url=…"> tags added to
  // the DOM and intercept the redirect URL before the browser acts on it.
  const metaRefreshIntercept =
    '(function(){' +
    'function checkMeta(node){' +
      'if(!node||!node.tagName||node.tagName!=="META")return;' +
      'var he=node.getAttribute("http-equiv");' +
      'if(!he||he.toLowerCase()!=="refresh")return;' +
      'var c=node.getAttribute("content")||"";' +
      'var m=/url\\s*=\\s*(?:["\']([^"\']*)["\']|([^\\s;]*))/i.exec(c);' +
      'if(!m)return;' +
      'var raw=m[1]||m[2]||"";if(!raw)return;' +
      'var abs;try{abs=new URL(raw,BASE).href;}catch(x){abs=raw;}' +
      'node.parentNode&&node.parentNode.removeChild(node);' +
      'if(/^https?:/i.test(abs)){POST("nav",{type:"browser-navigate",href:abs});}' +
    '}' +
    'try{' +
      // Check existing meta tags immediately
      'var metas=document.querySelectorAll("meta[http-equiv]");' +
      'for(var i=0;i<metas.length;i++)checkMeta(metas[i]);' +
      // Observe future additions
      'var obs=new MutationObserver(function(muts){' +
        'for(var i=0;i<muts.length;i++){' +
          'var added=muts[i].addedNodes;' +
          'for(var j=0;j<added.length;j++){' +
            'checkMeta(added[j]);' +
            'if(added[j].querySelectorAll){' +
              'var sub=added[j].querySelectorAll("meta[http-equiv]");' +
              'for(var k=0;k<sub.length;k++)checkMeta(sub[k]);' +
            '}' +
          '}' +
        '}' +
      '});' +
      'obs.observe(document.documentElement,{childList:true,subtree:true});' +
    '}catch(x){}' +
    '})();';

  // ── Closing ───────────────────────────────────────────────────────────────
  return preamble + linkIntercept + formIntercept + fetchIntercept +
    locationIntercept + metaRefreshIntercept + '})();';
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
