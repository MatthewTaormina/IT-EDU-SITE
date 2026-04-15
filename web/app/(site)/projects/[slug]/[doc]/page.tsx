import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeCalloutBlocks from '@/lib/rehype-callout-blocks';
import remarkProjectLinks from '@/lib/remark-project-links';
import {
  getProjectContent,
  getProjectDocContent,
  getProjectDocSlugs,
  getEntriesByType,
} from '@/lib/content';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { mdxComponents } from '@/components/mdx';

interface Props {
  params: Promise<{ slug: string; doc: string }>;
}

export async function generateStaticParams() {
  const projects = getEntriesByType('project');
  const params: Array<{ slug: string; doc: string }> = [];
  for (const project of projects) {
    const docs = getProjectDocSlugs(project.slug);
    for (const doc of docs) {
      params.push({ slug: project.slug, doc });
    }
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, doc } = await params;
  try {
    const { frontmatter } = getProjectDocContent(slug, doc);
    const title = (frontmatter.title as string | undefined) ?? doc;
    const { frontmatter: pf } = getProjectContent(slug);
    return { title, description: `${pf.title} — ${title}` };
  } catch {
    return {};
  }
}

export default async function ProjectDocPage({ params }: Props) {
  const { slug, doc } = await params;

  let docData;
  let projectData;
  try {
    docData = getProjectDocContent(slug, doc);
    projectData = getProjectContent(slug);
  } catch {
    notFound();
  }

  const { frontmatter, content } = docData;
  const docTitle = (frontmatter.title as string | undefined) ?? doc;
  const allDocs = getProjectDocSlugs(slug);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Breadcrumb
        crumbs={[
          { label: 'Projects', href: '/projects' },
          { label: projectData.frontmatter.title, href: `/projects/${slug}` },
          { label: docTitle },
        ]}
      />

      {/* Doc navigation */}
      {allDocs.length > 1 && (
        <nav
          className="mt-6 flex flex-wrap gap-2"
          aria-label="Project documents"
        >
          {allDocs.map((d) => {
            const isActive = d === doc;
            return (
              <Link
                key={d}
                href={`/projects/${slug}/${d}`}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted hover:text-foreground hover:border-primary'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {d.replace(/^\d+_/, '').replace(/_/g, ' ')}
              </Link>
            );
          })}
        </nav>
      )}

      <header className="mt-6 mb-10">
        <h1 className="text-3xl font-bold">{docTitle}</h1>
      </header>

      <article className="lesson-prose prose prose-slate dark:prose-invert max-w-none">
        <MDXRemote
          source={content}
          components={mdxComponents}
          options={{
            mdxOptions: {
              format: 'md',
              remarkPlugins: [remarkGfm, [remarkProjectLinks, { projectSlug: slug }]],
              rehypePlugins: [rehypeSlug, rehypeHighlight, rehypeCalloutBlocks],
            },
          }}
        />
      </article>

      {/* Back to project index */}
      <div className="mt-12 pt-6 border-t border-border">
        <Link
          href={`/projects/${slug}`}
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          <span aria-hidden="true">←</span> Back to project overview
        </Link>
      </div>
    </div>
  );
}
