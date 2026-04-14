'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle';

const navLinks = [
  { href: '/pathways', label: 'Pathways' },
  { href: '/learn', label: 'Courses' },
  { href: '/projects', label: 'Projects' },
  { href: '/articles', label: 'Articles' },
  { href: '/resources', label: 'Resources' },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // visible = nav bar shown; pinned-hidden = user manually hid it
  const [visible, setVisible] = useState(true);
  const [pinned, setPinned] = useState(false); // true = user explicitly hid it
  const lastScrollY = useRef(0);

  // Auto-hide on scroll down, reveal on scroll up — unless user pinned it hidden
  useEffect(() => {
    function onScroll() {
      if (pinned) return;
      const y = window.scrollY;
      if (y < 10) {
        setVisible(true);
      } else if (y > lastScrollY.current + 6) {
        setVisible(false);
        setMobileOpen(false);
      } else if (y < lastScrollY.current - 4) {
        setVisible(true);
      }
      lastScrollY.current = y;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pinned]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  function hide() {
    setPinned(true);
    setVisible(false);
    setMobileOpen(false);
  }

  function show() {
    setPinned(false);
    setVisible(true);
  }

  return (
    <>
      {/* ── Nav bar ─────────────────────────────────────────────────────── */}
      <header
        className={`sticky top-0 z-50 bg-surface border-b border-border transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="font-bold text-lg shrink-0 text-foreground hover:text-primary transition-colors">
            IT Learning Hub
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary-light text-primary'
                      : 'text-muted hover:text-foreground hover:bg-background'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />

            {/* Hide nav button */}
            <button
              onClick={hide}
              className="flex p-2 rounded-md text-muted hover:text-foreground transition-colors"
              aria-label="Hide navigation bar"
              title="Hide nav bar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>

            {/* Hamburger (mobile) */}
            <button
              className="md:hidden p-2 rounded-md text-muted hover:text-foreground"
              aria-label="Toggle menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="md:hidden border-t border-border bg-surface px-4 py-3 flex flex-col gap-1" aria-label="Mobile navigation">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    active
                      ? 'bg-primary-light text-primary'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        )}
      </header>

      {/* ── Reveal tab — shown when nav is hidden ───────────────────────── */}
      {!visible && (
        <button
          onClick={show}
          className="fixed top-0 left-1/2 -translate-x-1/2 z-50 px-4 py-1 bg-surface border border-border border-t-0 rounded-b-lg text-xs font-medium text-muted hover:text-foreground shadow-md transition-colors"
          aria-label="Show navigation bar"
        >
          <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Show nav
        </button>
      )}
    </>
  );
}
