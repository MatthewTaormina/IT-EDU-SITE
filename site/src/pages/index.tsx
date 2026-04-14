import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const stats = [
  { value: '60+', label: 'Lessons' },
  { value: '4',   label: 'Units' },
  { value: '1',   label: 'Pathway' },
  { value: '1',   label: 'Capstone' },
];

const features = [
  {
    icon: '🗺️',
    title: 'Structured Pathways',
    description:
      'Opinionated, end-to-end sequences designed to take you from zero to job-ready. No guesswork — just follow the map.',
    href: '/courses/Pathways',
    cta: 'Browse Pathways',
  },
  {
    icon: '📚',
    title: 'In-Depth Courses',
    description:
      'Each course is a complete curriculum — units, lessons, and topic reviews — so you always know where you are and what comes next.',
    href: '/courses/Courses',
    cta: 'Browse Courses',
  },
  {
    icon: '🛠️',
    title: 'Real Projects',
    description:
      'Capstone projects simulate professional work: a client brief, wireframes, acceptance criteria. Build something you can show employers.',
    href: '/courses/Projects',
    cta: 'Browse Projects',
  },
];

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroIcon} aria-hidden="true">&gt;_</div>
          <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
          <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
          <div className={styles.heroCtas}>
            <Link className="button button--primary button--lg" to="/courses/Courses">
              Browse Courses
            </Link>
            <Link className="button button--outline button--lg" to="/courses/Pathways" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.6)' }}>
              View Pathways
            </Link>
          </div>
        </div>
      </header>

      {/* ── Stats strip ────────────────────────────────────────────────── */}
      <div className={styles.statsStrip}>
        {stats.map(({ value, label }) => (
          <div key={label} className={styles.stat}>
            <span className={styles.statValue}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <main>
        <section className={styles.featuresSection}>
          <div className="container">
            <h2 className={styles.sectionTitle}>How the Hub is structured</h2>
            <div className={styles.featureGrid}>
              {features.map(({ icon, title, description, href, cta }) => (
                <Link key={title} to={href} className={styles.featureCard}>
                  <div className={styles.featureIcon} aria-hidden="true">{icon}</div>
                  <h3 className={styles.featureTitle}>{title}</h3>
                  <p className={styles.featureDescription}>{description}</p>
                  <span className={styles.featureLink}>{cta} →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA bar ──────────────────────────────────────────────────── */}
        <section className={styles.ctaSection}>
          <div className="container">
            <h2 className={styles.ctaTitle}>Ready to start?</h2>
            <p className={styles.ctaSubtitle}>
              Follow the Web Developer pathway and go from absolute beginner to a
              job-ready portfolio — all in one structured sequence.
            </p>
            <Link className="button button--primary button--lg" to="/courses/Pathways/webdev_beginner/">
              Start the Web Dev Pathway →
            </Link>
          </div>
        </section>
      </main>

    </Layout>
  );
}
