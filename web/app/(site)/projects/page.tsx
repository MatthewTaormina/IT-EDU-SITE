import type { Metadata } from 'next';
import { getEntriesByType } from '@/lib/content';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'Real-world capstone projects that simulate the job environment.',
};

export default function ProjectsPage() {
  const projects = getEntriesByType('project');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Projects</h1>
      <p className="text-muted mb-10">
        Capstone projects designed to simulate a real job environment — client briefs, tickets,
        assets, and starter code. Everything goes in your portfolio.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {projects.map((p) => (
          <Card
            key={p.slug}
            href={`/projects/${p.slug}`}
            title={p.title}
            description={p.description}
            difficulty={p.difficulty}
            tags={p.tags}
            meta={p.estimated_hours ? `${p.estimated_hours}h` : undefined}
          />
        ))}
      </div>
    </div>
  );
}
