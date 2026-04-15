'use client';

/**
 * LinuxMachine — BrowserApp
 *
 * Sandboxed in-desktop web browser.
 *
 * URL scheme
 * ──────────
 *   about:home        — styled start page with bookmarks
 *   about:blank       — empty white page
 *   local://slug/path — fictional in-world site; content read from VFS at
 *                       /var/www/slug/path (kind:'file') or fetched from
 *                       {stateEndpoint}/sites/slug/path.html
 *   sandbox://…       — opens a desktop app via kernel.openWith()
 *   http(s)://…       — proxied through /api/browser-proxy, removing all
 *                       X-Frame-Options / CSP headers that block embedding.
 *                       A <base href> tag is injected so relative assets in
 *                       the proxied page resolve against the original server.
 *
 * Proxy approach
 * ──────────────
 * External HTTP/HTTPS pages are fetched server-side by the Next.js middleware
 * at GET /api/browser-proxy?url=<encoded>. The middleware strips embedding-
 * blocking headers and injects a <base href> tag. The browser then loads the
 * result from our own origin, so no X-Frame-Options or CSP restrictions apply.
 *
 * Security
 * ────────
 * • javascript: / data: / vbscript: URLs are silently redirected to about:blank.
 * • The proxy blocks private/loopback IP ranges (SSRF guard in middleware.ts).
 * • Only URLs whose hostname matches an entry in browserAllowedSites are
 *   rendered; all others show an Access Blocked page.
 * • Fictional (local://) pages are served as <iframe srcdoc> with
 *   sandbox="allow-scripts allow-forms allow-modals" and no allow-same-origin,
 *   placing the content in a unique opaque origin, isolated from parent storage.
 * • URL bar input is normalized before any navigation occurs.
 *
 * AODA
 * ────
 * • URL bar: visible <label> via sr-only, aria-label on the input
 * • Back/Forward/Reload: aria-label + aria-disabled when unavailable
 * • iframe: title attribute reflects the active page title
 * • Loading / blocked / error / launched states use role="status" or role="alert"
 * • Home page search: role="search", associated <label> for the input
 */

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  type ReactNode,
  type KeyboardEvent,
  type FormEvent,
} from 'react';

import { useKernel, useMachineState, useStateEndpoint } from '../../LinuxMachine/MachineContext';
import type { BrowserAppState } from '../../LinuxMachine/MachineTypes';

// ─── URL helpers ─────────────────────────────────────────────────────────────

/** Normalise raw address-bar input to a canonical URL string. */
function normalizeUrl(raw: string): string {
  const t = raw.trim();
  if (!t || t === 'about:home') return 'about:home';
  if (t === 'about:blank')      return 'about:blank';
  if (t.startsWith('local://'))   return t;
  if (t.startsWith('sandbox://')) return t;
  // Block unsafe URL schemes
  if (/^(javascript|data|vbscript):/i.test(t)) return 'about:blank';
  if (t.startsWith('https://') || t.startsWith('http://')) return t;
  // Bare domain entry → force https
  return `https://${t}`;
}

/**
 * Returns true when navigating to `url` is permitted.
 * about:, local://, and sandbox:// URLs are always allowed.
 * HTTP/HTTPS URLs require a matching entry in `allowedSites`.
 */
function isAllowed(url: string, allowedSites: string[]): boolean {
  if (url.startsWith('about:') || url.startsWith('local://') || url.startsWith('sandbox://')) return true;
  try {
    const { hostname } = new URL(url);
    return allowedSites.some(site => {
      if (site === '*') return true;
      const siteHost = site.includes('://')
        ? (() => { try { return new URL(site).hostname; } catch { return site; } })()
        : site;
      return hostname === siteHost || hostname.endsWith(`.${siteHost}`);
    });
  } catch {
    return false;
  }
}

/**
 * Build the proxy URL for an external http/https page.
 * The middleware at /api/browser-proxy fetches the page server-side,
 * strips X-Frame-Options/CSP headers, and injects a <base href> tag.
 */
function proxyUrl(externalUrl: string): string {
  return `/api/browser-proxy?url=${encodeURIComponent(externalUrl)}`;
}

/** Map a sandbox:// URL to a human-readable app name for display. */
function sandboxAppName(url: string): string {
  const { slug } = (() => {
    const withoutScheme = url.slice('sandbox://'.length);
    const slug = withoutScheme.split('/')[0]?.split('?')[0] ?? '';
    return { slug };
  })();
  const names: Record<string, string> = {
    'terminal':      'Terminal',
    'browser':       'Browser',
    'text-editor':   'Text Editor',
    'email':         'Email',
    'ticket-app':    'Ticket Manager',
    'file-explorer': 'File Explorer',
  };
  return names[slug] ?? slug;
}

// ─── Nav intercept script ─────────────────────────────────────────────────────

/**
 * Injected into every iframe document (both srcdoc local:// pages and proxied
 * HTML) to intercept anchor clicks and forward the destination URL to the
 * parent BrowserApp via postMessage so in-app navigation history and the URL
 * bar stay in sync instead of the iframe navigating on its own.
 *
 * `window.name` is set to the BrowserApp `windowId` by the React component,
 * which lets the parent message listener ignore events from unrelated windows.
 */
const NAV_INTERCEPT_SCRIPT =
  "(function(){document.addEventListener('click',function(e){" +
  "var a=e.target.closest('a[href]');if(!a)return;" +
  "var raw=a.getAttribute('href');if(!raw||raw.charAt(0)==='#')return;" +
  "var href=a.href||raw;if(/^javascript:/i.test(href))return;" +
  "e.preventDefault();" +
  "window.parent.postMessage({type:'browser-navigate',href:href,windowId:window.name},'*');" +
  "},true);})();";

/** Inject the nav intercept `<script>` before `</head>` (or prepend). */
function injectNavScript(html: string): string {
  const tag = `<script>${NAV_INTERCEPT_SCRIPT}</script>`;
  const idx = html.indexOf('</head>');
  if (idx !== -1) return html.slice(0, idx) + tag + html.slice(idx);
  return tag + html;
}

// ─── Page state ───────────────────────────────────────────────────────────────

type PageState =
  | { kind: 'home' }
  | { kind: 'blank' }
  | { kind: 'loading'; url: string }
  | { kind: 'blocked'; url: string }
  | { kind: 'error'; url: string; message: string }
  | { kind: 'iframe'; src: string; title: string }
  | { kind: 'srcdoc'; html: string; title: string }
  | { kind: 'launched'; url: string; appName: string };

function getPageTitle(page: PageState): string {
  switch (page.kind) {
    case 'home':     return 'Home — FictBrowser';
    case 'blank':    return 'about:blank';
    case 'loading':  return `Loading… ${page.url}`;
    case 'blocked':  return `Blocked: ${page.url}`;
    case 'error':    return `Error: ${page.url}`;
    case 'iframe':   return page.title;
    case 'srcdoc':   return page.title;
    case 'launched': return `Launched: ${page.appName}`;
  }
}

// ─── NavButton ────────────────────────────────────────────────────────────────

interface NavButtonProps {
  label:    string;
  disabled: boolean;
  onClick:  () => void;
  shortcut?: string;
  children: ReactNode;
}

function NavButton({ label, disabled, onClick, shortcut, children }: NavButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-disabled={disabled}
      aria-keyshortcuts={shortcut}
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      className="w-7 h-7 flex items-center justify-center rounded text-base transition-colors"
      style={{
        color:      disabled ? '#484f58' : '#8b949e',
        cursor:     disabled ? 'default' : 'pointer',
        background: 'transparent',
      }}
      onMouseEnter={e => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = '#21262d';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

// ─── BrowserApp ───────────────────────────────────────────────────────────────

export interface BrowserAppProps {
  windowId: string;
  appState: BrowserAppState;
}

export function BrowserApp({ windowId, appState }: BrowserAppProps) {
  const kernel        = useKernel();
  const machineState  = useMachineState();
  const stateEndpoint = useStateEndpoint();

  // ── Navigation history ──────────────────────────────────────────────────
  const [navHistory, setNavHistory] = useState<string[]>(() =>
    appState.history.length > 0 ? appState.history : ['about:home'],
  );
  const [historyIdx, setHistoryIdx] = useState(() =>
    Math.max(0, Math.min(appState.historyIndex, (appState.history.length || 1) - 1)),
  );

  const currentUrl   = navHistory[historyIdx] ?? 'about:home';
  const canGoBack    = historyIdx > 0;
  const canGoForward = historyIdx < navHistory.length - 1;

  // ── URL bar ──────────────────────────────────────────────────────────────
  const [urlInput,   setUrlInput]   = useState(currentUrl);
  const [urlFocused, setUrlFocused] = useState(false);

  // ── Page content ─────────────────────────────────────────────────────────
  const [page, setPage] = useState<PageState>({ kind: 'home' });

  // Sync URL bar with navigation (unless user is actively typing)
  useEffect(() => {
    if (!urlFocused) setUrlInput(currentUrl);
  }, [currentUrl, urlFocused]);

  // ── Persist nav state to kernel window appState ─────────────────────────
  const syncKernel = useCallback((h: string[], idx: number): void => {
    kernel.updateWindowAppState(windowId, {
      url:          h[idx] ?? 'about:home',
      history:      h,
      historyIndex: idx,
    } satisfies BrowserAppState);
  }, [kernel, windowId]);

  // ── Core: resolve a URL to a PageState (does NOT modify nav history) ────
  const resolveUrl = useCallback(async (url: string): Promise<void> => {
    if (url === 'about:home')  { setPage({ kind: 'home'  }); return; }
    if (url === 'about:blank') { setPage({ kind: 'blank' }); return; }

    // HTTP/HTTPS — check allowlist, then proxy through /api/browser-proxy
    if (url.startsWith('https://') || url.startsWith('http://')) {
      if (!isAllowed(url, machineState.browserAllowedSites)) {
        setPage({ kind: 'blocked', url });
        return;
      }
      try {
        const { hostname } = new URL(url);
        // Load the page via the server-side proxy so X-Frame-Options /
        // Content-Security-Policy headers from the target site are stripped.
        setPage({ kind: 'iframe', src: proxyUrl(url), title: hostname });
      } catch {
        setPage({ kind: 'error', url, message: `Invalid URL: ${url}` });
      }
      return;
    }

    // Fictional local:// site
    if (url.startsWith('local://')) {
      setPage({ kind: 'loading', url });

      // local://slug/some/path → VFS at /var/www/slug/some/path
      const vfsPath    = `/var/www/${url.slice('local://'.length)}`;
      const vfsContent = kernel.readFile(vfsPath);
      if (vfsContent !== null) {
        const m = /<title[^>]*>([^<]+)<\/title>/i.exec(vfsContent);
        setPage({ kind: 'srcdoc', html: injectNavScript(vfsContent), title: m?.[1] ?? url });
        return;
      }

      // Fall back to fetching {stateEndpoint}/sites/slug/path.html
      if (stateEndpoint) {
        const urlBody = url.slice('local://'.length); // 'slug/some/path'
        try {
          const res = await fetch(
            `${stateEndpoint.replace(/\/$/, '')}/sites/${urlBody}.html`,
            { credentials: 'same-origin', headers: { Accept: 'text/html' } },
          );
          if (res.ok) {
            const html = await res.text();
            const m    = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
            setPage({ kind: 'srcdoc', html: injectNavScript(html), title: m?.[1] ?? url });
            return;
          }
        } catch {
          // Network failure — fall through to error page
        }
      }

      setPage({ kind: 'error', url, message: `Page not found: ${url}` });
      return;
    }

    setPage({ kind: 'error', url, message: `Unsupported URL scheme: ${url}` });
  }, [kernel, machineState.browserAllowedSites, stateEndpoint]);

  // ── Navigate (push new entry to history + resolve) ──────────────────────
  const navigate = useCallback((rawUrl: string): void => {
    const url = normalizeUrl(rawUrl);

    // AC 2.3: sandbox:// URLs launch desktop apps — don't push to browser history
    if (url.startsWith('sandbox://')) {
      kernel.openWith(url);
      setPage({ kind: 'launched', url, appName: sandboxAppName(url) });
      return;
    }

    const newHistory = [...navHistory.slice(0, historyIdx + 1), url];
    const newIdx     = newHistory.length - 1;
    setNavHistory(newHistory);
    setHistoryIdx(newIdx);
    setUrlInput(url);
    syncKernel(newHistory, newIdx);
    void resolveUrl(url);
  }, [kernel, navHistory, historyIdx, syncKernel, resolveUrl]);

  // ── Back / Forward / Reload ──────────────────────────────────────────────
  const goBack = useCallback((): void => {
    if (!canGoBack) return;
    const idx = historyIdx - 1;
    const url = navHistory[idx] ?? 'about:home';
    setHistoryIdx(idx);
    setUrlInput(url);
    syncKernel(navHistory, idx);
    void resolveUrl(url);
  }, [canGoBack, historyIdx, navHistory, syncKernel, resolveUrl]);

  const goForward = useCallback((): void => {
    if (!canGoForward) return;
    const idx = historyIdx + 1;
    const url = navHistory[idx] ?? 'about:home';
    setHistoryIdx(idx);
    setUrlInput(url);
    syncKernel(navHistory, idx);
    void resolveUrl(url);
  }, [canGoForward, historyIdx, navHistory, syncKernel, resolveUrl]);

  const reload = useCallback((): void => {
    void resolveUrl(currentUrl);
  }, [currentUrl, resolveUrl]);

  // ── Initial page load (once on mount) ───────────────────────────────────
  const didInitRef = useRef(false);
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    void resolveUrl(currentUrl);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Listen for in-iframe link clicks forwarded via postMessage ──────────
  useEffect(() => {
    function handleMessage(e: MessageEvent): void {
      if (!e.data || e.data.type !== 'browser-navigate') return;
      if (e.data.windowId !== windowId) return;
      const href = e.data.href;
      if (typeof href !== 'string' || !href) return;
      navigate(href);
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate, windowId]);

  // ── URL bar handlers ─────────────────────────────────────────────────────
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    navigate(urlInput);
  }, [urlInput, navigate]);

  const handleUrlKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Escape') {
      setUrlInput(currentUrl);
      (e.target as HTMLInputElement).blur();
    }
    // Mirror browser keyboard shortcuts from inside the URL bar
    if (e.altKey && e.key === 'ArrowLeft')  { e.preventDefault(); goBack(); }
    if (e.altKey && e.key === 'ArrowRight') { e.preventDefault(); goForward(); }
  }, [currentUrl, goBack, goForward]);

  // ── Render ───────────────────────────────────────────────────────────────
  const pageTitle = getPageTitle(page);

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: '#0d1117' }}
    >
      {/* ── Browser chrome ──────────────────────────────────────────────── */}
      <nav
        className="shrink-0 flex items-center gap-2 px-3 py-2"
        style={{ background: '#161b22', borderBottom: '1px solid #21262d' }}
        aria-label="Browser controls"
      >
        <NavButton
          label="Go back"
          disabled={!canGoBack}
          onClick={goBack}
          shortcut="Alt+ArrowLeft"
        >←</NavButton>

        <NavButton
          label="Go forward"
          disabled={!canGoForward}
          onClick={goForward}
          shortcut="Alt+ArrowRight"
        >→</NavButton>

        <NavButton
          label="Reload page"
          disabled={page.kind === 'loading'}
          onClick={reload}
          shortcut="F5"
        >↺</NavButton>

        <form
          className="flex-1 min-w-0"
          role="search"
          aria-label="Address bar"
          onSubmit={handleSubmit}
        >
          <label htmlFor={`url-bar-${windowId}`} className="sr-only">
            Enter a URL or search query
          </label>
          <input
            id={`url-bar-${windowId}`}
            type="text"
            value={urlInput}
            autoComplete="off"
            spellCheck={false}
            className="w-full px-3 py-1 rounded text-sm"
            style={{
              background: '#0d1117',
              color:       '#c9d1d9',
              border:      '1px solid #30363d',
            }}
            onFocus={e => {
              setUrlFocused(true);
              e.target.select();
              e.currentTarget.style.borderColor = '#58a6ff';
            }}
            onBlur={e => {
              setUrlFocused(false);
              setUrlInput(currentUrl);
              e.currentTarget.style.borderColor = '#30363d';
            }}
            onChange={e => setUrlInput(e.target.value)}
            onKeyDown={handleUrlKeyDown}
          />
        </form>
      </nav>

      {/* ── Page content ────────────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-hidden"
        aria-label={pageTitle}
      >
        <PageRenderer
          page={page}
          windowId={windowId}
          pageTitle={pageTitle}
          onNavigate={navigate}
          allowedSites={machineState.browserAllowedSites}
        />
      </main>
    </div>
  );
}

// ─── PageRenderer ─────────────────────────────────────────────────────────────

interface PageRendererProps {
  page:         PageState;
  windowId:     string;
  pageTitle:    string;
  onNavigate:   (url: string) => void;
  allowedSites: string[];
}

function PageRenderer({
  page,
  pageTitle,
  onNavigate,
  allowedSites,
  windowId,
}: PageRendererProps) {
  switch (page.kind) {
    case 'home':
      return <HomePage onNavigate={onNavigate} allowedSites={allowedSites} />;

    case 'blank':
      return (
        <div
          className="h-full w-full"
          style={{ background: '#fff' }}
          aria-label="Blank page"
        />
      );

    case 'loading':
      return (
        <div
          className="h-full flex items-center justify-center"
          style={{ background: '#0d1117' }}
          role="status"
          aria-live="polite"
          aria-label={`Loading ${page.url}`}
        >
          <span style={{ color: '#8b949e', fontSize: '0.875rem' }}>
            Loading {page.url}…
          </span>
        </div>
      );

    case 'blocked':
      return (
        <div
          className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center"
          style={{ background: '#0d1117' }}
          role="alert"
        >
          <div style={{ fontSize: '2.5rem', lineHeight: 1 }} aria-hidden="true">🚫</div>
          <h2 style={{ color: '#c9d1d9', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
            Access Blocked
          </h2>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', maxWidth: '26rem', margin: 0 }}>
            <strong style={{ color: '#c9d1d9' }}>{page.url}</strong> is not in the
            allowed sites list for this environment.
          </p>
          {allowedSites.length > 0 && (
            <p style={{ color: '#484f58', fontSize: '0.75rem', margin: 0 }}>
              Allowed: {allowedSites.filter(s => s !== '*').join(', ') || '(all origins)'}
            </p>
          )}
        </div>
      );

    case 'error':
      return (
        <div
          className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center"
          style={{ background: '#0d1117' }}
          role="alert"
        >
          <div style={{ fontSize: '2.5rem', lineHeight: 1 }} aria-hidden="true">⚠️</div>
          <h2 style={{ color: '#c9d1d9', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
            Page Not Found
          </h2>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', margin: 0 }}>
            {page.message}
          </p>
          <p style={{ color: '#484f58', fontSize: '0.75rem', margin: 0 }}>
            {page.url}
          </p>
        </div>
      );

    case 'iframe':
      /*
       * The src points to /api/browser-proxy?url=... which serves the page
       * from our own origin — no X-Frame-Options or CSP constraints apply.
       * We still pass sandbox flags to limit what the proxied content can do.
       */
      return (
        <iframe
          key={`${windowId}-${page.src}`}
          name={windowId}
          src={page.src}
          title={page.title}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-downloads"
        />
      );

    case 'srcdoc':
      return (
        <iframe
          key={`${windowId}-srcdoc-${page.title}`}
          name={windowId}
          srcDoc={page.html}
          title={pageTitle}
          className="w-full h-full border-0"
          sandbox="allow-scripts allow-forms allow-modals"
          style={{ background: '#fff' }}
        />
      );

    case 'launched':
      return (
        <div
          className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center"
          style={{ background: '#0d1117' }}
          role="status"
          aria-live="polite"
          aria-label={`${page.appName} launched`}
        >
          <div style={{ fontSize: '2.5rem', lineHeight: 1 }} aria-hidden="true">🚀</div>
          <h2 style={{ color: '#c9d1d9', fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
            Launching {page.appName}
          </h2>
          <p style={{ color: '#8b949e', fontSize: '0.875rem', maxWidth: '26rem', margin: 0 }}>
            The application has been opened in a new window on the desktop.
          </p>
          <p style={{ color: '#484f58', fontSize: '0.75rem', margin: 0, fontFamily: 'monospace' }}>
            {page.url}
          </p>
        </div>
      );

    default:
      page satisfies never;
      return null;
  }
}

// ─── HomePage ─────────────────────────────────────────────────────────────────

interface HomePageProps {
  onNavigate:   (url: string) => void;
  allowedSites: string[];
}

function HomePage({ onNavigate, allowedSites }: HomePageProps) {
  const [query, setQuery] = useState('');

  function handleSearch(e: FormEvent<HTMLFormElement>): void {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    // If it looks like a URL or local:// path, navigate directly
    if (q.startsWith('local://') || (q.includes('.') && !q.includes(' '))) {
      onNavigate(q);
    } else {
      // Wikipedia search embeds fine; DuckDuckGo/Google block iframes
      onNavigate(`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(q)}&ns0=1`);
    }
  }

  const bookmarks = allowedSites.filter(s => s !== '*').slice(0, 8);

  return (
    <div
      className="h-full flex flex-col items-center justify-center gap-8 p-8"
      style={{ background: '#0d1117' }}
    >
      {/* Brand wordmark */}
      <div className="text-center select-none" aria-hidden="true">
        <p style={{ color: '#58a6ff', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
          FictBrowser
        </p>
        <p style={{ color: '#484f58', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          Sandboxed in-world browser
        </p>
      </div>
      {/* sr-only heading for screen readers */}
      <h1 className="sr-only">FictBrowser — home page</h1>

      {/* Search / address bar */}
      <form
        className="w-full max-w-md"
        role="search"
        aria-label="Search or enter URL"
        onSubmit={handleSearch}
      >
        <label htmlFor="browser-home-input" className="sr-only">
          Search the web or enter a URL
        </label>
        <div className="flex gap-2">
          <input
            id="browser-home-input"
            type="text"
            value={query}
            placeholder="Search or enter address…"
            autoFocus
            className="flex-1 px-4 py-2 rounded-lg text-sm"
            style={{
              background: '#161b22',
              color:       '#c9d1d9',
              border:      '1px solid #30363d',
            }}
            onChange={e => setQuery(e.target.value)}
            onFocus={e  => { e.currentTarget.style.borderColor = '#58a6ff'; }}
            onBlur={e   => { e.currentTarget.style.borderColor = '#30363d'; }}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium"
            style={{ background: '#1f6feb', color: '#ffffff' }}
            aria-label="Go to URL or search"
          >
            Go
          </button>
        </div>
      </form>

      {/* Quick-access bookmarks (from browserAllowedSites) */}
      {bookmarks.length > 0 && (
        <section aria-label="Quick access bookmarks">
          <h2
            className="text-center text-xs mb-3"
            style={{ color: '#484f58' }}
          >
            Quick Access
          </h2>
          <ul className="flex flex-wrap justify-center gap-2 list-none p-0 m-0">
            {bookmarks.map(site => {
              const href  = site.startsWith('http') || site.startsWith('local://')
                ? site
                : `https://${site}`;
              const label = site
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '');
              return (
                <li key={site}>
                  <button
                    type="button"
                    onClick={() => onNavigate(href)}
                    className="px-3 py-1.5 rounded text-xs transition-colors"
                    style={{
                      background: '#161b22',
                      color:       '#8b949e',
                      border:      '1px solid #21262d',
                    }}
                    aria-label={`Go to ${label}`}
                    onMouseEnter={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.borderColor = '#30363d';
                      el.style.color = '#c9d1d9';
                    }}
                    onMouseLeave={e => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.borderColor = '#21262d';
                      el.style.color = '#8b949e';
                    }}
                  >
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}
