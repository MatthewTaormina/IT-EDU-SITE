import type { Metadata } from 'next';
import { getEntriesByType } from '@/lib/content';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Explainers, industry overviews, and deep-dives on web development topics.',
};

export default function ArticlesPage() {
  const articles = getEntriesByType('article');

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Articles</h1>
      <p className="text-muted mb-10">
        Standalone explainers and deep-dives on web development concepts, history, and industry context.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {articles.map((a) => (
          <Card
            key={a.slug}
            href={`/articles/${a.slug}`}
            title={a.title}
            description={a.description}
            tags={a.tags}
            meta={a.published_date}
          />
        ))}
      </div>
    </div>
  );
}
