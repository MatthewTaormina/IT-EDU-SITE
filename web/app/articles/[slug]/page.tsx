import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeCalloutBlocks from '@/lib/rehype-callout-blocks';
import { getArticleContent, getEntriesByType } from '@/lib/content';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { mdxComponents } from '@/components/mdx';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getEntriesByType('article').map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = getArticleContent(slug);
    return { title: frontmatter.title, description: frontmatter.description };
  } catch {
    return {};
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  let article;
  try {
    article = getArticleContent(slug);
  } catch {
    notFound();
  }

  const { frontmatter, content } = article;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Breadcrumb crumbs={[{ label: 'Articles', href: '/articles' }, { label: frontmatter.title }]} />

      <header className="mt-6 mb-10">
        <h1 className="text-3xl font-bold mb-3">{frontmatter.title}</h1>
        <p className="text-muted text-lg mb-4">{frontmatter.description}</p>
        <div className="flex gap-3 text-sm text-muted flex-wrap">
          {frontmatter.author && <span>By {frontmatter.author}</span>}
          {frontmatter.published_date && (
            <span>· <time dateTime={frontmatter.published_date}>{new Date(frontmatter.published_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time></span>
          )}
        </div>
      </header>

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
    </div>
  );
}
