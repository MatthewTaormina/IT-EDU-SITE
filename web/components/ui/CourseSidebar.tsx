'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { NavItem } from '@/lib/types';

interface Props {
  tree: NavItem[];
  courseTitle: string;
  courseHref: string;
}

export default function CourseSidebar({ tree, courseTitle, courseHref }: Props) {
  const pathname = usePathname();

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-surface overflow-y-auto">
      <div className="p-4 border-b border-border">
        <Link href={courseHref} className="font-semibold text-sm hover:text-primary transition-colors">
          {courseTitle}
        </Link>
      </div>
      <nav className="p-2" aria-label="Course contents">
        <NavItems items={tree} pathname={pathname} depth={0} />
      </nav>
    </aside>
  );
}

function NavItems({
  items,
  pathname,
  depth,
}: {
  items: NavItem[];
  pathname: string;
  depth: number;
}) {
  return (
    <ul className="space-y-0.5">
      {items.map((item) =>
        item.kind === 'lesson' ? (
          <li key={item.slug}>
            <Link
              href={item.href}
              className={`block px-3 py-1.5 rounded-md text-sm transition-colors ${
                depth > 0 ? 'ml-4' : ''
              } ${
                pathname === item.href
                  ? 'bg-primary-light text-primary font-medium'
                  : 'text-muted hover:text-foreground hover:bg-background'
              }`}
            >
              {item.title}
            </Link>
          </li>
        ) : (
          <li key={item.slug}>
            <span
              className={`block px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted ${
                depth > 0 ? 'ml-4' : ''
              } mt-3 first:mt-0`}
            >
              {item.title}
            </span>
            <NavItems items={item.children} pathname={pathname} depth={depth + 1} />
          </li>
        ),
      )}
    </ul>
  );
}
