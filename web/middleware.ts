/**
 * Next.js Edge Middleware — browser-proxy handler
 *
 * Intercepts GET /api/browser-proxy?url=<encoded-url> requests and returns
 * a server-side fetched copy of the remote page, stripping headers that would
 * block iframe embedding (X-Frame-Options, Content-Security-Policy, etc.) and
 * injecting a `<base href>` tag into HTML responses so relative asset URLs
 * continue to resolve against the original server.
 *
 * Why middleware instead of an API route?
 * ────────────────────────────────────────
 * The proxy is implemented as middleware (rather than an app/api route) so it
 * runs in the Edge Runtime. The Edge Runtime is available for fetch and
 * string manipulation — everything this proxy needs — and it avoids adding a
 * dedicated route file on disk.
 *
 * Security
 * ────────
 * • Only http:// and https:// are proxied.
 * • Private / loopback / link-local addresses are blocked (SSRF guard).
 * • Response bodies are capped at 10 MB.
 * • Set-Cookie, Clear-Site-Data, and credential headers are stripped.
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

// ─── Response headers to strip ────────────────────────────────────────────────

/** Upstream headers that would prevent iframe embedding or leak credentials. */
const STRIP_HEADERS = new Set([
  'x-frame-options',
  'content-security-policy',
  'content-security-policy-report-only',
  'set-cookie',
  'clear-site-data',
  'cross-origin-opener-policy',
  'cross-origin-embedder-policy',
  'cross-origin-resource-policy',
]);

// ─── Body size cap ────────────────────────────────────────────────────────────

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ─── Middleware ───────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest): Promise<NextResponse> {
  // Only handle GET
  if (request.method !== 'GET') {
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

  // ── Fetch the target page ─────────────────────────────────────────────────
  let upstream: Response;
  try {
    upstream = await fetch(rawUrl, {
      method:  'GET',
      headers: {
        // Identify as a regular desktop browser to improve compatibility
        'User-Agent':      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept':          'text/html,application/xhtml+xml,application/xml;q=0.9,image/*,*/*;q=0.8',
        'Accept-Language': 'en-CA,en;q=0.9',
        // Ask for plain (uncompressed) responses so we can manipulate the body
        'Accept-Encoding': 'identity',
      },
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

  if (isHtml) {
    const html   = new TextDecoder('utf-8', { fatal: false }).decode(bodyBuffer);
    responseBody     = injectBaseTag(html, finalUrl);
    finalContentType = 'text/html; charset=utf-8';
  } else {
    responseBody     = bodyBuffer;
    finalContentType = contentType;
  }

  // ── Build response headers ────────────────────────────────────────────────
  const headers = new Headers();

  for (const [k, v] of upstream.headers.entries()) {
    if (!STRIP_HEADERS.has(k.toLowerCase())) {
      try { headers.set(k, v); } catch { /* skip malformed names */ }
    }
  }

  // Overrides
  headers.set('Content-Type',  finalContentType);
  headers.set('Cache-Control', 'no-store');
  // Allow our own origin to embed the proxied content in an iframe
  headers.set('X-Frame-Options', 'SAMEORIGIN');

  return new NextResponse(responseBody, {
    status:  upstream.status,
    headers,
  });
}
