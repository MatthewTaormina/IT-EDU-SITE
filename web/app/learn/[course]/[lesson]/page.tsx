import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeCalloutBlocks from '@/lib/rehype-callout-blocks';
import {
  getLessonContent,
  getCourseContent,
  getPrevNextLesson,
  generateLessonStaticParams,
} from '@/lib/content';
import Breadcrumb from '@/components/ui/Breadcrumb';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import { mdxComponents } from '@/components/mdx';

interface Props {
  params: Promise<{ course: string; lesson: string }>;
}

export async function generateStaticParams() {
  return generateLessonStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lesson } = await params;
  try {
    const { frontmatter } = getLessonContent(lesson);
    return {
      title: frontmatter.title,
      description: frontmatter.description,
    };
  } catch {
    return {};
  }
}

export default async function LessonPage({ params }: Props) {
  const { course, lesson } = await params;

  let lessonData;
  let courseData;
  try {
    lessonData = getLessonContent(lesson);
    courseData = getCourseContent(course);
  } catch {
    notFound();
  }

  const { frontmatter, content } = lessonData;
  const { prev, next } = getPrevNextLesson(course, lesson);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <Breadcrumb
        crumbs={[
          { label: 'Courses', href: '/learn' },
          { label: courseData.frontmatter.title, href: `/learn/${course}` },
          { label: frontmatter.title },
        ]}
      />

      {/* Lesson header */}
      <header className="mt-6 mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <DifficultyBadge difficulty={frontmatter.difficulty} />
          {frontmatter.duration_minutes && (
            <span className="text-sm text-muted">{frontmatter.duration_minutes} min read</span>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-3">{frontmatter.title}</h1>
        <p className="text-muted text-lg">{frontmatter.description}</p>
      </header>

      {/* Lesson content */}
      <article className="lesson-prose prose prose-slate dark:prose-invert max-w-none">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, rehypeHighlight, rehypeCalloutBlocks],
            },
          }}
        />
      </article>

      {/* Prev / Next navigation */}
      <nav
        className="mt-16 pt-6 border-t border-border flex items-center justify-between gap-4"
        aria-label="Lesson navigation"
      >
        {prev ? (
          <Link
            href={prev.href}
            className="group flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors max-w-[45%]"
          >
            <span className="text-lg">←</span>
            <span className="truncate">
              <span className="block text-xs mb-0.5">Previous</span>
              <span className="group-hover:text-primary transition-colors">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <div />
        )}

        {next ? (
          <Link
            href={next.href}
            className="group flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors max-w-[45%] text-right ml-auto"
          >
            <span className="truncate">
              <span className="block text-xs mb-0.5">Next</span>
              <span className="group-hover:text-primary transition-colors">{next.title}</span>
            </span>
            <span className="text-lg shrink-0">→</span>
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </div>
  );
}
