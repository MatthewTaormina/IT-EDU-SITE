import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeCalloutBlocks from '@/lib/rehype-callout-blocks';
import { getProjectContent, getEntriesByType } from '@/lib/content';
import Breadcrumb from '@/components/ui/Breadcrumb';
import DifficultyBadge from '@/components/ui/DifficultyBadge';
import { mdxComponents } from '@/components/mdx';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getEntriesByType('project').map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = getProjectContent(slug);
    return { title: frontmatter.title, description: frontmatter.description };
  } catch {
    return {};
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  let project;
  try {
    project = getProjectContent(slug);
  } catch {
    notFound();
  }

  const { frontmatter, content } = project;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Projects', href: '/projects' }, { label: frontmatter.title }]} />

      <header className="mt-6 mb-10">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <DifficultyBadge difficulty={frontmatter.difficulty} />
          <span className="text-xs font-medium px-2 py-0.5 bg-surface border border-border rounded-full text-muted uppercase">
            {frontmatter.format}
          </span>
          {frontmatter.estimated_hours && (
            <span className="text-sm text-muted">~{frontmatter.estimated_hours}h</span>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-3">{frontmatter.title}</h1>
        <p className="text-muted text-lg">{frontmatter.description}</p>
      </header>

      <article className="prose prose-slate dark:prose-invert max-w-none">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSlug, rehypeCalloutBlocks],
            },
          }}
        />
      </article>
    </div>
  );
}
