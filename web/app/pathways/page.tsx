import type { Metadata } from 'next';
import { getEntriesByType } from '@/lib/content';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Pathways',
  description: 'Curated learning sequences from beginner to job-ready.',
};

export default function PathwaysPage() {
  const pathways = getEntriesByType('pathway');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Learning Pathways</h1>
      <p className="text-muted mb-10">
        Each pathway is a curated sequence of courses leading to a specific goal. Start at the
        beginning or jump in where you fit.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {pathways.map((p) => (
          <Card
            key={p.slug}
            href={`/pathways/${p.slug}`}
            title={p.title}
            description={p.description}
            meta={p.estimated_hours ? `${p.estimated_hours}h` : undefined}
            difficulty={p.difficulty}
            tags={p.tags}
          />
        ))}
      </div>
    </div>
  );
}
