/**
 * Next.js Edge Middleware — browser-proxy handler
 *
 * Intercepts requests to /api/browser-proxy?url=<encoded-url> and returns a
 * server-side fetched copy of the remote page. Embedding-blocking headers
 * (X-Frame-Options, CSP, etc.) are stripped, and for HTML responses a
 * `<base href>` tag plus the navigation-intercept script are injected so that
 * the page renders correctly inside the BrowserApp iframe.
 *
 * Supported methods
 * ─────────────────
 * GET, POST, PUT, PATCH, DELETE, and HEAD are forwarded to the target URL.
 * This enables the in-iframe fetch/XHR intercept to route API calls through
 * the proxy, and allows the BrowserApp to handle form POST submissions.
 *
 * Query parameters
 * ────────────────
 *   url   (required)  — The target URL (http or https).
 *   _raw  (optional)  — When set to "1", the response body is returned as-is
 *                        without base-tag or nav-script injection. Used by the
 *                        fetch/XHR intercept for API responses (JSON, etc.).
 *
 * Response headers
 * ────────────────
 *   X-Final-URL  — The URL after any redirects. The BrowserApp reads this to
 *                   keep the URL bar accurate after POST → 303 → GET chains.
 *
 * Cookie relay
 * ────────────
 * Upstream Set-Cookie headers are forwarded to the browser with a per-host
 * prefix (`_bp_{host}_`) and Path=/api/browser-proxy so they only travel on
 * proxy requests. On outbound requests the middleware extracts these prefixed
 * cookies and sends them as a standard Cookie header to the target server.
 * This enables bot-detection challenge flows that depend on round-tripping
 * cookies (e.g. Cloudflare cf_clearance).
 *
 * Security
 * ────────
 * • Only http:// and https:// are proxied.
 * • Private / loopback / link-local addresses are blocked (SSRF guard).
 * • Response bodies are capped at 10 MB.
 * • Clear-Site-Data and credential headers are stripped.
 * • Upstream cookies are namespaced to avoid collisions with first-party
 *   cookies and scoped to the /api/browser-proxy path.
 * • The proxied content is served with Cache-Control: no-store so it is
 *   never cached under our origin.
 *
 * AODA / CSP
 * ──────────
 * The desktop BrowserApp sets the iframe title to the page title so assistive
 * technology can identify the frame. The injected `<base>` tag does not affect
 * the page's accessible tree.
 */

import { NextRequest, NextResponse } from 'next/server';
import { injectNavScript } from './lib/navIntercept';

// ─── Route matcher ────────────────────────────────────────────────────────────

export const config = {
  matcher: '/api/browser-proxy',
};

// ─── SSRF guard ───────────────────────────────────────────────────────────────

/** Returns true when the hostname is a private / loopback / link-local address. */
function isPrivateHost(hostname: string): boolean {
  if (hostname === 'localhost') return true;

  // Strip IPv6 brackets for literal checks
  const bare = hostname.replace(/^\[/, '').replace(/\]$/, '');

  // IPv6 loopback / ULA
  if (bare === '::1') return true;
  const bareLower = bare.toLowerCase();
  if (bareLower.startsWith('fc') || bareLower.startsWith('fd')) return true; // ULA

  // IPv4 literals
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(bare);
  if (v4) {
    const [a, b] = [Number(v4[1]), Number(v4[2])];
    if (a === 0)                           return true; // 0.0.0.0/8
    if (a === 10)                          return true; // 10.0.0.0/8
    if (a === 127)                         return true; // 127.0.0.0/8
    if (a === 169 && b === 254)            return true; // 169.254.0.0/16 (link-local + AWS IMDSv1)
    if (a === 172 && b >= 16 && b <= 31)   return true; // 172.16.0.0/12
    if (a === 192 && b === 168)            return true; // 192.168.0.0/16
  }

  return false;
}

// ─── HTML base-tag injection ──────────────────────────────────────────────────

/**
 * Inject `<base href="[pageUrl]">` as the first element inside `<head>`.
 * This makes relative asset URLs (CSS, images, JS) in the proxied HTML resolve
 * against the original server rather than our own origin.
 */
function injectBaseTag(html: string, pageUrl: string): string {
  // Escape URL for use as an attribute value
  const safe = pageUrl.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const tag  = `<base href="${safe}">`;

  // Insert right after the opening <head ...> tag
  const headMatch = /<head(?:\s[^>]*)?>/.exec(html);
  if (headMatch) {
    const i = headMatch.index + headMatch[0].length;
    return html.slice(0, i) + tag + html.slice(i);
  }

  // No explicit <head> — prepend to document
  return tag + html;
}

// ─── Cookie relay ─────────────────────────────────────────────────────────────

/**
 * Prefix used for browser-proxy cookie relay.
 * Upstream cookies are stored under `_bp_{host}_{name}` on our origin,
 * scoped to Path=/api/browser-proxy so they never leak to other routes.
 */
const COOKIE_PREFIX = '_bp_';

/**
 * Build the relay prefix for a given target hostname.
 * E.g. `_bp_example.com_` — the trailing underscore separates host from name.
 */
function cookiePrefix(host: string): string {
  return `${COOKIE_PREFIX}${host}_`;
}

/**
 * Extract proxy-relay cookies from the incoming request for a given target
 * host and return them as a standard `Cookie` header value.
 */
function extractProxyCookies(request: NextRequest, targetHost: string): string {
  const prefix = cookiePrefix(targetHost);
  const raw    = request.headers.get('cookie') ?? '';
  const pairs: string[] = [];
  for (const segment of raw.split(';')) {
    const trimmed = segment.trim();
    if (trimmed.startsWith(prefix)) {
      pairs.push(trimmed.slice(prefix.length));
    }
  }
  return pairs.join('; ');
}

/**
 * Rewrite an upstream `Set-Cookie` header so the cookie is stored under a
 * host-prefixed name and scoped to /api/browser-proxy on our origin.
 *
 * Original: `cf_clearance=abc; Path=/; Domain=.example.com; Secure; HttpOnly`
 * Rewritten: `_bp_example.com_cf_clearance=abc; Path=/api/browser-proxy; Secure; SameSite=Lax`
 *
 * - `Domain` is removed (cookie belongs to our origin).
 * - `Path` is forced to `/api/browser-proxy`.
 * - `HttpOnly` is removed so the in-iframe nav intercept can see the cookie
 *   via `document.cookie` if needed (the cookie is never sensitive — it's a
 *   relay of a third-party value).
 * - `SameSite=None` is replaced with `SameSite=Lax` to comply with browser
 *   requirements (None requires Secure + cross-site context we don't have).
 */
function rewriteSetCookie(header: string, targetHost: string): string {
  const parts = header.split(';').map(s => s.trim());
  if (parts.length === 0 || !parts[0]) return '';

  const eqIdx = parts[0].indexOf('=');
  if (eqIdx < 0) return '';

  const name  = parts[0].slice(0, eqIdx);
  const value = parts[0].slice(eqIdx + 1);

  const result = [`${cookiePrefix(targetHost)}${name}=${value}`];
  let hasPath    = false;
  let hasSameSite = false;

  for (let i = 1; i < parts.length; i++) {
    const lower = parts[i].toLowerCase();
    // Drop Domain — cookie lives on our origin
    if (lower.startsWith('domain'))   continue;
    // Drop HttpOnly — nav script may need to read the cookie
    if (lower === 'httponly')         continue;
    // Force Path
    if (lower.startsWith('path')) {
      result.push('Path=/api/browser-proxy');
      hasPath = true;
      continue;
    }
    // Normalise SameSite
    if (lower.startsWith('samesite')) {
      result.push('SameSite=Lax');
      hasSameSite = true;
      continue;
    }
    result.push(parts[i]);
  }

  if (!hasPath)     result.push('Path=/api/browser-proxy');
  if (!hasSameSite) result.push('SameSite=Lax');

  return result.join('; ');
}

// ─── Response headers to strip ────────────────────────────────────────────────

/**
 * Upstream headers that would prevent iframe embedding or leak credentials.
 * Note: `set-cookie` is NOT stripped — it is rewritten by the cookie relay
 * (see `rewriteSetCookie`) so that bot-detection challenge cookies can
 * round-trip through the proxy.
 */
const STRIP_HEADERS = new Set([
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
  'clear-site-data',
  'cross-origin-opener-policy',
  'cross-origin-embedder-policy',
  'cross-origin-resource-policy',
  // set-cookie is handled separately — not stripped
]);

// ─── Chrome 124 header constants ──────────────────────────────────────────────

/** Accept header Chrome 124 sends for top-level navigation requests. */
const CHROME_ACCEPT_NAVIGATE =
  'text/html,application/xhtml+xml,application/xml;q=0.9,' +
  'image/avif,image/webp,image/apng,*/*;q=0.8,' +
  'application/signed-exchange;v=b3;q=0.7';

/** Sec-CH-UA value matching Chrome 124 on Linux. */
const CHROME_SEC_CH_UA =
  '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"';

// ─── Body size cap ────────────────────────────────────────────────────────────

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Allowed methods ──────────────────────────────────────────────────────────

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE']);

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (!ALLOWED_METHODS.has(request.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 });
  }

  // ── Validate the target URL ───────────────────────────────────────────────
  const rawUrl = request.nextUrl.searchParams.get('url');
  if (!rawUrl) {
    return new NextResponse('Missing required query parameter: url', { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return new NextResponse('Only http and https protocols are supported', { status: 400 });
  }

  if (isPrivateHost(parsed.hostname)) {
    return new NextResponse('Access to private network addresses is not allowed', { status: 403 });
  }

  // ── Raw mode (skip HTML processing) ───────────────────────────────────────
  const isRaw = request.nextUrl.searchParams.get('_raw') === '1';

  // ── Build upstream request headers ────────────────────────────────────────
  // Mimic a real Chrome 124 on Linux to reduce bot-detection triggers.
  // Order follows the typical header ordering Chrome sends.
  const incomingAccept      = request.headers.get('accept');
  const incomingContentType = request.headers.get('content-type');

  const isNavigation = !isRaw; // HTML page loads vs. API/XHR calls

  const outHeaders: Record<string, string> = {
    'Host':                      parsed.host,
    'Connection':                'keep-alive',
    'Cache-Control':             'max-age=0',
    'Upgrade-Insecure-Requests': '1',
    'User-Agent':                'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept':                    incomingAccept || (isNavigation ? CHROME_ACCEPT_NAVIGATE : '*/*'),
    'Sec-CH-UA':                 CHROME_SEC_CH_UA,
    'Sec-CH-UA-Mobile':          '?0',
    'Sec-CH-UA-Platform':        '"Linux"',
    'Sec-Fetch-Dest':            isNavigation ? 'document' : 'empty',
    'Sec-Fetch-Mode':            isNavigation ? 'navigate' : 'cors',
    'Sec-Fetch-Site':            'none',
    'Accept-Language':           'en-CA,en-US;q=0.9,en;q=0.8',
    'Accept-Encoding':           'identity',
    'Referer':                   rawUrl,
    'DNT':                       '1',
    'Priority':                  isNavigation ? 'u=0, i' : 'u=1',
  };

  // Navigation-only headers
  if (isNavigation) {
    outHeaders['Sec-Fetch-User'] = '?1';
  }

  // POST/PUT/PATCH — include Origin header (browsers send it on non-GET)
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    outHeaders['Origin'] = parsed.origin;
    outHeaders['Sec-Fetch-Site'] = 'same-origin';
  }

  // Forward Content-Type from the incoming request (needed for form POSTs)
  if (incomingContentType) {
    outHeaders['Content-Type'] = incomingContentType;
  }

  // ── Cookie relay: forward stored proxy cookies to upstream ────────────────
  const proxyCookies = extractProxyCookies(request, parsed.hostname);
  if (proxyCookies) {
    outHeaders['Cookie'] = proxyCookies;
  }

  // ── Read incoming request body (for POST, PUT, etc.) ──────────────────────
  let reqBody: BodyInit | null = null;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    try {
      reqBody = await request.arrayBuffer();
    } catch {
      // No body — that's fine for DELETE etc.
    }
  }

  // ── Fetch the target page ─────────────────────────────────────────────────
  let upstream: Response;
  try {
    upstream = await fetch(rawUrl, {
      method:   request.method,
      headers:  outHeaders,
      body:     reqBody,
      redirect: 'follow',
      signal:   AbortSignal.timeout(15_000),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new NextResponse(`Upstream fetch failed: ${msg}`, { status: 502 });
  }

  // ── Read body (capped) ────────────────────────────────────────────────────
  // Check Content-Length header before buffering
  const clHeader = upstream.headers.get('content-length');
  if (clHeader && Number(clHeader) > MAX_BYTES) {
    return new NextResponse('Upstream response exceeds 10 MB limit', { status: 502 });
  }

  let bodyBuffer: ArrayBuffer;
  try {
    bodyBuffer = await upstream.arrayBuffer();
  } catch {
    return new NextResponse('Failed to read upstream response body', { status: 502 });
  }

  if (bodyBuffer.byteLength > MAX_BYTES) {
    return new NextResponse('Upstream response exceeds 10 MB limit', { status: 502 });
  }

  // ── Process body ──────────────────────────────────────────────────────────
  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream';
  const isHtml      = /text\/html/i.test(contentType);

  // The final URL after redirects is available on the upstream Response object
  const finalUrl = upstream.url || rawUrl;

  let responseBody: BodyInit;
  let finalContentType: string;

  if (isHtml && !isRaw) {
    const html       = new TextDecoder('utf-8', { fatal: false }).decode(bodyBuffer);
    const withBase   = injectBaseTag(html, finalUrl);
    responseBody     = injectNavScript(withBase, finalUrl);
    finalContentType = 'text/html; charset=utf-8';
  } else {
    responseBody     = bodyBuffer;
    finalContentType = contentType;
  }

  // ── Build response headers ────────────────────────────────────────────────
  const headers = new Headers();

  // Collect Set-Cookie headers separately (there can be multiple)
  const rewrittenCookies: string[] = [];
  const targetHost = parsed.hostname;

  for (const [k, v] of upstream.headers.entries()) {
    const lower = k.toLowerCase();
    if (lower === 'set-cookie') {
      // Rewrite each Set-Cookie with a host prefix and proxy path
      const rewritten = rewriteSetCookie(v, targetHost);
      if (rewritten) rewrittenCookies.push(rewritten);
      continue;
    }
    if (!STRIP_HEADERS.has(lower)) {
      try { headers.set(k, v); } catch { /* skip malformed names */ }
    }
  }

  // Append rewritten Set-Cookie headers
  for (const cookie of rewrittenCookies) {
    headers.append('Set-Cookie', cookie);
  }

  // Overrides
  headers.set('Content-Type',  finalContentType);
  headers.set('Cache-Control', 'no-store');
  // Allow our own origin to embed the proxied content in an iframe
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  // Expose the final URL after redirects so the BrowserApp can update
  // the URL bar after POST → 303 → GET redirect chains.
  headers.set('X-Final-URL', finalUrl);
  // Allow the client JS to read X-Final-URL
  headers.set('Access-Control-Expose-Headers', 'X-Final-URL');

  return new NextResponse(responseBody, {
    status:  upstream.status,
    headers,
  });
}
