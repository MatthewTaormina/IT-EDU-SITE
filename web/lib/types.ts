export type ContentType =
  | 'lesson'
  | 'unit'
  | 'course'
  | 'pathway'
  | 'article'
  | 'project'
  | 'resource';

export type Difficulty =
  | 'Beginner'
  | 'Intermediate'
  | 'Advanced'
  | 'Beginner to Intermediate';

export interface CatalogEntry {
  slug: string;
  type: ContentType;
  title: string;
  description: string;
  path: string;
  tags?: string[];
  difficulty?: string;
  domain?: string;
  estimated_hours?: number;
  author?: string;
  published_date?: string;
}

export interface ContentRef {
  type: string;
  slug: string;
}

// ─── Per-type frontmatter ─────────────────────────────────────────────────────

export interface LessonFrontmatter {
  type: 'lesson';
  title: string;
  description: string;
  duration_minutes: number;
  difficulty: Difficulty;
  tags: string[];
}

export interface UnitFrontmatter {
  type: 'unit';
  title: string;
  description: string;
  domain: string;
  difficulty: string;
  prerequisites: string[];
  learning_objectives: string[];
  references: ContentRef[];
}

export interface CourseFrontmatter {
  type: 'course';
  title: string;
  description: string;
  domain: string;
  difficulty: string;
  prerequisites?: string[];
  tags?: string[];
  estimated_hours?: number;
  references: ContentRef[];
}

export interface PathwayFrontmatter {
  type: 'pathway';
  title: string;
  description: string;
  difficulty: string;
  estimated_hours: number;
  tags: string[];
  goal?: string;
  audience?: string;
  references: ContentRef[];
}

export interface ArticleFrontmatter {
  type: 'article';
  title: string;
  description: string;
  tags: string[];
  author: string;
  published_date: string;
}

export interface ProjectFrontmatter {
  type: 'project';
  format: 'build' | 'ticket';
  title: string;
  description: string;
  difficulty: Difficulty;
  estimated_hours: number;
  tags: string[];
  references?: ContentRef[];
}

// ─── Course sidebar navigation tree ─────────────────────────────────────────

export interface LessonNavItem {
  kind: 'lesson';
  slug: string;
  title: string;
  href: string;
}

export interface UnitNavItem {
  kind: 'unit';
  slug: string;
  title: string;
  children: NavItem[];
}

export type NavItem = LessonNavItem | UnitNavItem;
