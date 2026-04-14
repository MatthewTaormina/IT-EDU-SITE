import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources',
  description: 'Curated external resources — docs, videos, tools, and reference sites.',
};

export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Resources</h1>
      <p className="text-muted mb-10">
        Curated external resources — documentation, videos, tools, and reference sites to supplement
        your learning.
      </p>
      <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">
        <p className="text-lg font-medium mb-2">Coming soon</p>
        <p className="text-sm">
          The external resources catalog is in progress. Check back after the next sprint.
        </p>
      </div>
    </div>
  );
}
