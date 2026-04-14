import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export interface CatalogItem {
  /** Emoji or short icon rendered above the title */
  icon?: string;
  title: string;
  description: string;
  /** Absolute or relative URL the card links to */
  href: string;
  /** Shown as an outlined badge (e.g. "Beginner", "Intermediate") */
  difficulty?: string;
  /** Array of lowercase topic tags shown as chips */
  tags?: string[];
  /** Right-aligned meta text (e.g. "~60 hours", "4 Units") */
  meta?: string;
}

interface CatalogSearchProps {
  items: CatalogItem[];
  placeholder?: string;
}

export default function CatalogSearch({
  items,
  placeholder = 'Search…',
}: CatalogSearchProps): React.ReactElement {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const filtered =
    q === ''
      ? items
      : items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.difficulty?.toLowerCase().includes(q) ||
            item.tags?.some((t) => t.toLowerCase().includes(q)),
        );

  return (
    <div>
      {/* visually hidden label keeps the input accessible */}
      <label htmlFor="catalog-search" className={styles.srOnly}>
        Search
      </label>
      <input
        id="catalog-search"
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={styles.searchInput}
      />

      {filtered.length === 0 ? (
        <p className={styles.noResults}>
          No results for &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className={styles.grid}>
          {filtered.map((item) => (
            <li key={item.href} className={styles.cardWrapper}>
              <Link to={item.href} className={styles.card}>
                {item.icon && (
                  <div className={styles.cardIcon} aria-hidden="true">
                    {item.icon}
                  </div>
                )}
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDescription}>{item.description}</p>
                <div className={styles.cardFooter}>
                  {item.difficulty && (
                    <span className={styles.badge}>{item.difficulty}</span>
                  )}
                  {item.tags?.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                  {item.meta && (
                    <span className={styles.meta}>{item.meta}</span>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
