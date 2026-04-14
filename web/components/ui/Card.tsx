import Link from 'next/link';
import DifficultyBadge from './DifficultyBadge';

interface CardProps {
  href: string;
  title: string;
  description: string;
  difficulty?: string;
  tags?: string[];
  meta?: string;
}

export default function Card({ href, title, description, difficulty, tags, meta }: CardProps) {
  return (
    <Link
      href={href}
      className="block p-6 bg-surface border border-border rounded-xl hover:border-primary hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors">
          {title}
        </h3>
        {difficulty && <DifficultyBadge difficulty={difficulty} />}
      </div>

      <p className="text-muted text-sm leading-relaxed mb-4 line-clamp-3">{description}</p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {tags?.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-background rounded-full text-muted border border-border"
            >
              {tag}
            </span>
          ))}
        </div>
        {meta && <span className="text-xs text-muted font-medium shrink-0">{meta}</span>}
      </div>
    </Link>
  );
}
