import { getCourseNavTree, getCourseContent, getEntriesByType } from '@/lib/content';
import CourseSidebar from '@/components/ui/CourseSidebar';
import { notFound } from 'next/navigation';

interface Props {
  children: React.ReactNode;
  params: Promise<{ course: string }>;
}

export default async function CourseLayout({ children, params }: Props) {
  const { course } = await params;

  let courseData;
  try {
    courseData = getCourseContent(course);
  } catch {
    notFound();
  }

  const tree = getCourseNavTree(course);

  return (
    <div className="flex flex-1 min-h-0 flex-col md:flex-row">
      <CourseSidebar
        tree={tree}
        courseTitle={courseData.frontmatter.title}
        courseHref={`/learn/${course}`}
      />
      <div className="flex-1 min-w-0 overflow-y-auto">{children}</div>
    </div>
  );
}
