import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type {
  CatalogEntry,
  CourseFrontmatter,
  UnitFrontmatter,
  LessonFrontmatter,
  PathwayFrontmatter,
  ArticleFrontmatter,
  ProjectFrontmatter,
  NavItem,
  LessonNavItem,
  UnitNavItem,
  ContentRef,
} from './types';

const CONTENT_ROOT = path.join(process.cwd(), '..', 'Content');
const CATALOG_PATH = path.join(CONTENT_ROOT, 'catalog.json');

// ─── Catalog ─────────────────────────────────────────────────────────────────

let _catalog: CatalogEntry[] | null = null;

export function getCatalog(): CatalogEntry[] {
  if (!_catalog) {
    const raw = fs.readFileSync(CATALOG_PATH, 'utf-8');
    _catalog = JSON.parse(raw) as CatalogEntry[];
  }
  return _catalog;
}

export function getEntryBySlug(slug: string): CatalogEntry | undefined {
  return getCatalog().find((e) => e.slug === slug);
}

export function getEntriesByType(type: string): CatalogEntry[] {
  return getCatalog().filter((e) => e.type === type);
}

// ─── File reading ─────────────────────────────────────────────────────────────

function resolvePath(catalogRelativePath: string): string {
  return path.join(CONTENT_ROOT, catalogRelativePath);
}

function readContentFile(
  catalogRelativePath: string,
): { frontmatter: Record<string, unknown>; content: string } {
  const fullPath = resolvePath(catalogRelativePath);
  const raw = fs.readFileSync(fullPath, 'utf-8');
  const { data: frontmatter, content } = matter(raw);
  return { frontmatter, content };
}

export function getLessonContent(slug: string): {
  frontmatter: LessonFrontmatter;
  content: string;
  entry: CatalogEntry;
} {
  const entry = getEntryBySlug(slug);
  if (!entry) throw new Error(`Lesson not found: ${slug}`);
  const { frontmatter, content } = readContentFile(entry.path);
  return { frontmatter: frontmatter as unknown as LessonFrontmatter, content, entry };
}

export function getCourseContent(slug: string): {
  frontmatter: CourseFrontmatter;
  content: string;
  entry: CatalogEntry;
} {
  const entry = getEntryBySlug(slug);
  if (!entry) throw new Error(`Course not found: ${slug}`);
  const { frontmatter, content } = readContentFile(entry.path);
  return { frontmatter: frontmatter as unknown as CourseFrontmatter, content, entry };
}

export function getUnitContent(slug: string): {
  frontmatter: UnitFrontmatter;
  content: string;
} {
  const entry = getEntryBySlug(slug);
  if (!entry) throw new Error(`Unit not found: ${slug}`);
  const { frontmatter, content } = readContentFile(entry.path);
  return { frontmatter: frontmatter as unknown as UnitFrontmatter, content };
}

export function getPathwayContent(slug: string): {
  frontmatter: PathwayFrontmatter;
  content: string;
  entry: CatalogEntry;
} {
  const entry = getEntryBySlug(slug);
  if (!entry) throw new Error(`Pathway not found: ${slug}`);
  const { frontmatter, content } = readContentFile(entry.path);
  return { frontmatter: frontmatter as unknown as PathwayFrontmatter, content, entry };
}

export function getArticleContent(slug: string): {
  frontmatter: ArticleFrontmatter;
  content: string;
  entry: CatalogEntry;
} {
  const entry = getEntryBySlug(slug);
  if (!entry) throw new Error(`Article not found: ${slug}`);
  const { frontmatter, content } = readContentFile(entry.path);
  return { frontmatter: frontmatter as unknown as ArticleFrontmatter, content, entry };
}

export function getProjectContent(slug: string): {
  frontmatter: ProjectFrontmatter;
  content: string;
  entry: CatalogEntry;
} {
  const entry = getEntryBySlug(slug);
  if (!entry) throw new Error(`Project not found: ${slug}`);
  const { frontmatter, content } = readContentFile(entry.path);
  return { frontmatter: frontmatter as unknown as ProjectFrontmatter, content, entry };
}

// ─── Course navigation tree ───────────────────────────────────────────────────

function buildNavItems(refs: ContentRef[], courseSlug: string): NavItem[] {
  return refs
    .filter((r) => r.type === 'lesson' || r.type === 'unit')
    .map((ref): NavItem => {
      if (ref.type === 'lesson') {
        const entry = getEntryBySlug(ref.slug);
        return {
          kind: 'lesson',
          slug: ref.slug,
          title: entry?.title ?? ref.slug,
          href: `/learn/${courseSlug}/${ref.slug}`,
        } satisfies LessonNavItem;
      } else {
        const { frontmatter } = getUnitContent(ref.slug);
        const children = buildNavItems(frontmatter.references ?? [], courseSlug);
        return {
          kind: 'unit',
          slug: ref.slug,
          title: frontmatter.title,
          children,
        } satisfies UnitNavItem;
      }
    });
}

export function getCourseNavTree(courseSlug: string): NavItem[] {
  const { frontmatter } = getCourseContent(courseSlug);
  return buildNavItems(frontmatter.references ?? [], courseSlug);
}

// ─── Static params helpers ────────────────────────────────────────────────────

function flattenLessons(items: NavItem[]): LessonNavItem[] {
  const lessons: LessonNavItem[] = [];
  for (const item of items) {
    if (item.kind === 'lesson') {
      lessons.push(item);
    } else {
      lessons.push(...flattenLessons(item.children));
    }
  }
  return lessons;
}

export function getAllLessonsForCourse(courseSlug: string): LessonNavItem[] {
  return flattenLessons(getCourseNavTree(courseSlug));
}

export function generateLessonStaticParams(): Array<{ course: string; lesson: string }> {
  const courses = getEntriesByType('course');
  const params: Array<{ course: string; lesson: string }> = [];
  for (const course of courses) {
    const lessons = getAllLessonsForCourse(course.slug);
    for (const lesson of lessons) {
      params.push({ course: course.slug, lesson: lesson.slug });
    }
  }
  return params;
}

// ─── Prev / next lesson ───────────────────────────────────────────────────────

export function getPrevNextLesson(
  courseSlug: string,
  lessonSlug: string,
): { prev?: LessonNavItem; next?: LessonNavItem } {
  const all = getAllLessonsForCourse(courseSlug);
  const idx = all.findIndex((l) => l.slug === lessonSlug);
  return {
    prev: idx > 0 ? all[idx - 1] : undefined,
    next: idx < all.length - 1 ? all[idx + 1] : undefined,
  };
}

// ─── Lesson → course lookup ───────────────────────────────────────────────────

export function getLessonCourse(lessonSlug: string): string | undefined {
  for (const course of getEntriesByType('course')) {
    const lessons = getAllLessonsForCourse(course.slug);
    if (lessons.some((l) => l.slug === lessonSlug)) return course.slug;
  }
  return undefined;
}
