import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
        <p>
          &copy; {new Date().getFullYear()} IT Learning Hub — free &amp; open-source
        </p>
        <nav className="flex gap-6" aria-label="Footer">
          <Link href="/pathways" className="hover:text-foreground transition-colors">Pathways</Link>
          <Link href="/learn" className="hover:text-foreground transition-colors">Courses</Link>
          <Link href="/projects" className="hover:text-foreground transition-colors">Projects</Link>
          <Link href="/articles" className="hover:text-foreground transition-colors">Articles</Link>
          <Link href="/resources" className="hover:text-foreground transition-colors">Resources</Link>
        </nav>
      </div>
    </footer>
  );
}
