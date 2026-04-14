import type { Metadata } from 'next';
import { getEntriesByType } from '@/lib/content';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Courses',
  description: 'All web development courses — from web foundations to advanced full-stack.',
};

export default function LearnPage() {
  const courses = getEntriesByType('course');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Courses</h1>
      <p className="text-muted mb-10">
        Each course is a complete deep-dive into a topic area. Follow a pathway to take them in order,
        or jump directly to what you need.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((c) => (
          <Card
            key={c.slug}
            href={`/learn/${c.slug}`}
            title={c.title}
            description={c.description}
            difficulty={c.difficulty}
          />
        ))}
      </div>
    </div>
  );
}
