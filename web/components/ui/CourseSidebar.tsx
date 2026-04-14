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

// ── Sidebar visibility ───────────────────────────────────────────────────────
function useSidebarVisible() {
  const [visible, setVisible] = useState(true);
  return { visible, hide: () => setVisible(false), show: () => setVisible(true) };
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CourseSidebar({ tree, courseTitle, courseHref }: Props) {
  const pathname = usePathname();
  const { collapsed, toggle } = useCollapsedUnits(courseHref);
  const { visible, hide, show } = useSidebarVisible();

  // Auto-expand the unit that contains the active lesson on first load
  useEffect(() => {
    // no-op: units start expanded by default (not in collapsed set)
  }, []);

  if (!visible) {
    return (
      <button
        onClick={show}
        className="shrink-0 w-7 flex flex-col items-center justify-start pt-4 gap-1 border-r border-border bg-surface hover:bg-background transition-colors group"
        aria-label="Show course sidebar"
        title="Show sidebar"
      >
        <svg aria-hidden="true" className="w-4 h-4 text-muted group-hover:text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-3 py-3 border-b border-border shrink-0">
        <Link
          href={courseHref}
          className="font-semibold text-sm leading-tight hover:text-primary transition-colors line-clamp-2"
        >
          {courseTitle}
        </Link>
        <button
          onClick={hide}
          className="shrink-0 p-1 rounded text-muted hover:text-foreground transition-colors"
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

            {!isCollapsed && item.children.length > 0 && (
              <div className={depth >= 0 ? 'ml-3 border-l border-border' : ''}>
                <NavItems
                  items={item.children}
                  pathname={pathname}
                  depth={depth + 1}
                  collapsed={collapsed}
                  toggle={toggle}
                />
              </div>
            )}
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
