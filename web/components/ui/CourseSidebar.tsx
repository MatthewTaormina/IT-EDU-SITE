'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import type { NavItem } from '@/lib/types';

interface Props {
  tree: NavItem[];
  courseTitle: string;
  courseHref: string;
}

// ── Persist collapsed-unit state in sessionStorage ──────────────────────────
function useCollapsedUnits(courseHref: string) {
  const key = `sidebar-collapsed:${courseHref}`;
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggle = useCallback(
    (slug: string) => {
      setCollapsed((prev) => {
        const next = new Set(prev);
        next.has(slug) ? next.delete(slug) : next.add(slug);
        try { sessionStorage.setItem(key, JSON.stringify([...next])); } catch { /* noop */ }
        return next;
      });
    },
    [key],
  );

  return { collapsed, toggle };
}

// ── Sidebar visibility (desktop) ─────────────────────────────────────────────
function useSidebarVisible() {
  const [visible, setVisible] = useState(true);
  return { visible, hide: () => setVisible(false), show: () => setVisible(true) };
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CourseSidebar({ tree, courseTitle, courseHref }: Props) {
  const pathname = usePathname();
  const { collapsed, toggle } = useCollapsedUnits(courseHref);
  const { visible, hide, show } = useSidebarVisible();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Close mobile drawer on Esc — WCAG 2.1.2 (no keyboard trap)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && mobileOpen) setMobileOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  return (
    <>
      {/* ── Mobile course nav bar (visible on mobile only) ───────────────── */}
      <div className="md:hidden flex items-center gap-3 px-4 py-2.5 border-b border-border bg-surface shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 text-sm font-medium text-foreground min-w-0 min-h-[44px]"
          aria-expanded={mobileOpen}
          aria-controls="mobile-course-nav"
          aria-label="Open course navigation"
        >
          <svg aria-hidden="true" className="w-4 h-4 shrink-0 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
          <span className="truncate">{courseTitle}</span>
        </button>
      </div>

      {/* ── Mobile overlay drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${courseTitle} — course navigation`}
          className="md:hidden fixed inset-0 z-50 flex"
        >
          {/* Backdrop — tap to dismiss */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer panel */}
          <div
            id="mobile-course-nav"
            className="relative w-72 max-w-[85vw] bg-surface h-full overflow-y-auto shadow-xl flex flex-col"
          >
            <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-border shrink-0">
              <Link
                href={courseHref}
                className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2"
              >
                {courseTitle}
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="shrink-0 p-2 rounded text-muted hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close course navigation"
              >
                <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2" aria-label="Course contents">
              <NavItems
                items={tree}
                pathname={pathname}
                depth={0}
                collapsed={collapsed}
                toggle={toggle}
              />
            </nav>
          </div>
        </div>
      )}

      {/* ── Desktop sidebar (hidden on mobile) ───────────────────────────── */}
      {!visible ? (
        <button
          onClick={show}
          className="hidden md:flex shrink-0 w-10 flex-col items-center justify-start pt-4 gap-1 border-r border-border bg-surface hover:bg-background transition-colors group"
          aria-label="Show course sidebar"
          title="Show sidebar"
        >
          <svg aria-hidden="true" className="w-4 h-4 text-muted group-hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <aside className="hidden md:flex w-64 shrink-0 border-r border-border bg-surface flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-border shrink-0">
            <Link
              href={courseHref}
              className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2"
            >
              {courseTitle}
            </Link>
            {/* Touch target ≥ 44px (WCAG 2.5.5) */}
            <button
              onClick={hide}
              className="shrink-0 p-2 rounded text-muted hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Hide sidebar"
              title="Hide sidebar"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Nav tree */}
          <nav className="flex-1 overflow-y-auto p-2" aria-label="Course contents">
            <NavItems
              items={tree}
              pathname={pathname}
              depth={0}
              collapsed={collapsed}
              toggle={toggle}
            />
          </nav>
        </aside>
      )}
    </>
  );
}

// ── Recursive nav items ──────────────────────────────────────────────────────
const LESSON_INDENT = ['pl-2', 'pl-5', 'pl-8', 'pl-11'] as const;
const UNIT_INDENT   = ['pl-1', 'pl-4', 'pl-7', 'pl-10'] as const;

function NavItems({
  items,
  pathname,
  depth,
  collapsed,
  toggle,
}: {
  items: NavItem[];
  pathname: string;
  depth: number;
  collapsed: Set<string>;
  toggle: (slug: string) => void;
}) {
  const d = Math.min(depth, 3) as 0 | 1 | 2 | 3;

  return (
    <ul className="space-y-0.5">
      {items.map((item) => {
        if (item.kind === 'lesson') {
          const active = pathname === item.href;
          return (
            <li key={item.slug}>
              <Link
                href={item.href}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-sm transition-colors ${LESSON_INDENT[d]} ${
                  active
                    ? 'bg-primary-light text-primary font-medium'
                    : 'text-muted hover:text-foreground hover:bg-background'
                }`}
              >
                {depth > 0 && (
                  <span className="opacity-30 shrink-0 text-xs" aria-hidden="true">›</span>
                )}
                <span className="leading-snug">{item.title}</span>
              </Link>
            </li>
          );
        }

        // unit
        const isCollapsed = collapsed.has(item.slug);
        const hasActive = containsActive(item.children, pathname);
        const regionId = `unit-nav-${item.slug}`;

        return (
          <li key={item.slug} className={depth > 0 ? 'mt-1' : 'mt-3 first:mt-1'}>
            <button
              onClick={() => toggle(item.slug)}
              className={`w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wide transition-colors ${UNIT_INDENT[d]} ${
                hasActive
                  ? 'text-foreground'
                  : 'text-muted hover:text-foreground hover:bg-background'
              }`}
              aria-expanded={!isCollapsed}
              aria-controls={regionId}
            >
              {/* chevron */}
              <svg
                aria-hidden="true"
                className={`w-3 h-3 shrink-0 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-90'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
              <span className="truncate">{item.title}</span>
            </button>

            <div
              id={regionId}
              hidden={isCollapsed}
              className={!isCollapsed && item.children.length > 0 ? (depth >= 0 ? 'ml-3 border-l border-border' : '') : ''}
            >
              {!isCollapsed && item.children.length > 0 && (
                <NavItems
                  items={item.children}
                  pathname={pathname}
                  depth={depth + 1}
                  collapsed={collapsed}
                  toggle={toggle}
                />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

// Returns true if any descendant lesson matches the current path
function containsActive(items: NavItem[], pathname: string): boolean {
  for (const item of items) {
    if (item.kind === 'lesson' && item.href === pathname) return true;
    if (item.kind === 'unit' && containsActive(item.children, pathname)) return true;
  }
  return false;
}

