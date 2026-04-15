import type { Metadata } from 'next';
import Link from 'next/link';
import { getEntriesByType } from '@/lib/content';
import Card from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'IT Learning Hub — Learn Web Development Free',
  description:
    'Structured learning pathways from zero to job-ready. Free, open-source web development education.',
};

export default function HomePage() {
  const pathways = getEntriesByType('pathway');
  const courses = getEntriesByType('course');
  const lessons = getEntriesByType('lesson');

  const totalHours = pathways.reduce((acc, p) => acc + (p.estimated_hours ?? 0), 0);

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-linear-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-6 py-24 md:py-32">
          <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-4">
            Free · Open-Source · No Account Required
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
            Learn Web Development.<br />
            Build Real Things.
          </h1>
          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mb-10 leading-relaxed">
            Structured paths from zero experience to job-ready skills — with interactive exercises,
            real projects, and no fluff.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/pathways"
              className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Browse Pathways
            </Link>
            <Link
              href="/learn"
              className="border border-white/60 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
            >
              All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-wrap gap-10 justify-center">
          <Stat value={lessons.length} label="Lessons" />
          <Stat value={courses.length} label="Courses" />
          <Stat value={`${totalHours}h+`} label="of content" />
          <Stat value="Free" label="Always" />
        </div>
      </section>

      {/* ── Pathways ─────────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">Learning Pathways</h2>
            <p className="text-muted mt-1">Curated sequences from beginner to employable.</p>
          </div>
          <Link href="/pathways" className="text-sm text-primary font-medium hover:underline">
            All pathways <span aria-hidden="true">→</span>
          </Link>
        </div>
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
      </section>

      {/* ── Courses ──────────────────────────────────────────────────────── */}
      <section className="bg-surface border-t border-border">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">All Courses</h2>
              <p className="text-muted mt-1">Standalone deep-dives you can take in any order.</p>
            </div>
            <Link href="/learn" className="text-sm text-primary font-medium hover:underline">
              All courses <span aria-hidden="true">→</span>
            </Link>
          </div>
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
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              title: 'Pick a Pathway',
              body: 'Choose a structured path that matches your goal — complete beginner or filling a specific skill gap.',
            },
            {
              step: '02',
              title: 'Follow the Lessons',
              body: 'Each lesson is focused and practical. No account or sign-up needed — just start learning.',
            },
            {
              step: '03',
              title: 'Build a Project',
              body: 'Every pathway ends with a real capstone project that goes straight to your portfolio.',
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary-light text-primary text-sm font-bold flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                {step}
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-muted text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted mt-0.5">{label}</div>
    </div>
  );
}

