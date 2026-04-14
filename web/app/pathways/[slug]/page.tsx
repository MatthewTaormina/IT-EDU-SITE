import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEntriesByType, getPathwayContent, getCourseContent } from '@/lib/content';
import Card from '@/components/ui/Card';
import Breadcrumb from '@/components/ui/Breadcrumb';
import DifficultyBadge from '@/components/ui/DifficultyBadge';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getEntriesByType('pathway').map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = getPathwayContent(slug);
    return { title: frontmatter.title, description: frontmatter.description };
  } catch {
    return {};
  }
}

export default async function PathwayPage({ params }: Props) {
  const { slug } = await params;

  let pathway;
  try {
    pathway = getPathwayContent(slug);
  } catch {
    notFound();
  }

  const { frontmatter } = pathway;
  const courses = frontmatter.references
    .filter((r) => r.type === 'course')
    .map((r) => {
      try {
        return getCourseContent(r.slug);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Pathways', href: '/pathways' }, { label: frontmatter.title }]} />

      <div className="mt-6 mb-10">
        <div className="flex items-start gap-4 flex-wrap mb-3">
          <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
          <DifficultyBadge difficulty={frontmatter.difficulty} />
        </div>
        <p className="text-muted text-lg mb-4">{frontmatter.description}</p>
        {frontmatter.goal && (
          <p className="text-sm bg-primary-light text-primary border border-primary/20 rounded-lg px-4 py-3 max-w-2xl">
            🎯 <strong>Goal:</strong> {frontmatter.goal}
          </p>
        )}
        {frontmatter.estimated_hours && (
          <p className="text-sm text-muted mt-3">
            Estimated time: <strong>{frontmatter.estimated_hours} hours</strong>
          </p>
        )}
      </div>

      <h2 className="text-xl font-semibold mb-4">Courses in this pathway</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {courses.map((c) => {
          if (!c) return null;
          return (
            <Card
              key={c.entry.slug}
              href={`/learn/${c.entry.slug}`}
              title={c.frontmatter.title}
              description={c.frontmatter.description}
              difficulty={c.frontmatter.difficulty}
            />
          );
        })}
      </div>
    </div>
  );
}
