import { notFound } from 'next/navigation';
import { courses, getCourseBySlug } from '@/features/services/courseData';
import CourseDetail from '@/features/services/CourseDetail';

export function generateStaticParams() {
  return courses.map(course => ({ course: course.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const course = getCourseBySlug(slug);
  return { title: course ? `${course.title} | Leafclutch` : 'Course Not Found' };
}

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();
  return <CourseDetail course={course} />;
}
