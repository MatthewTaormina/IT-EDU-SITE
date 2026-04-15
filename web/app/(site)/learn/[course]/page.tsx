import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCourseContent, getCourseNavTree, getEntriesByType, getAllLessonsForCourse } from '@/lib/content';
import Breadcrumb from '@/components/ui/Breadcrumb';
import DifficultyBadge from '@/components/ui/DifficultyBadge';

interface Props {
  params: Promise<{ course: string }>;
}

export async function generateStaticParams() {
  return getEntriesByType('course').map((c) => ({ course: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course } = await params;
  try {
    const { frontmatter } = getCourseContent(course);
    return { title: frontmatter.title, description: frontmatter.description };
  } catch {
    return {};
  }
}

export default async function CoursePage({ params }: Props) {
  const { course } = await params;

  let courseData;
  try {
    courseData = getCourseContent(course);
  } catch {
    notFound();
  }

  const { frontmatter, entry } = courseData;
  const tree = getCourseNavTree(course);
  const allLessons = getAllLessonsForCourse(course);
  const firstLesson = allLessons[0];

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Breadcrumb
        crumbs={[
          { label: 'Courses', href: '/learn' },
          { label: frontmatter.title },
        ]}
      />

      <div className="mt-6 mb-10">
        <div className="flex items-start gap-4 flex-wrap mb-3">
          <h1 className="text-3xl font-bold">{frontmatter.title}</h1>
          <DifficultyBadge difficulty={frontmatter.difficulty} />
        </div>
        <p className="text-muted text-lg mb-6">{frontmatter.description}</p>

        <div className="flex flex-wrap gap-3 text-sm text-muted mb-6">
          <span>{allLessons.length} lessons</span>
          {entry.estimated_hours && <span>· ~{entry.estimated_hours}h</span>}
          {frontmatter.domain && <span>· {frontmatter.domain}</span>}
        </div>

        {firstLesson && (
          <Link
            href={firstLesson.href}
            className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dk transition-colors"
          >
            Start Course <span aria-hidden="true">→</span>
          </Link>
        )}
      </div>

      {/* Unit list */}
      <div className="space-y-6">
        {tree
          .filter((item) => item.kind === 'unit')
          .map((unit) => {
            if (unit.kind !== 'unit') return null;
            const lessonCount = unit.children.filter((c) => c.kind === 'lesson').length;
            return (
              <div key={unit.slug} className="border border-border rounded-xl overflow-hidden">
                <div className="bg-surface px-5 py-3 border-b border-border">
                  <h2 className="font-semibold">{unit.title}</h2>
                  {lessonCount > 0 && (
                    <p className="text-muted text-xs mt-0.5">{lessonCount} lessons</p>
                  )}
                </div>
                <ul className="divide-y divide-border">
                  {unit.children
                    .filter((c) => c.kind === 'lesson')
                    .map((lesson) => {
                      if (lesson.kind !== 'lesson') return null;
                      return (
                        <li key={lesson.slug}>
                          <Link
                            href={lesson.href}
                            className="flex items-center gap-2 px-5 py-3 hover:bg-background transition-colors text-sm"
                          >
                            <span className="text-muted" aria-hidden="true">›</span>
                            {lesson.title}
                          </Link>
                        </li>
                      );
                    })}
                </ul>
              </div>
            );
          })}
      </div>
    </div>
  );
}
