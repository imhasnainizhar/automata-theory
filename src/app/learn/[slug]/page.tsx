import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CHAPTERS, getChapter } from '@/content/chapters';
import { CHAPTER_CONTENT } from '@/content/pages';

export function generateStaticParams() {
  return CHAPTERS.map((c) => ({ slug: c.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getChapter(slug);
  return c ? { title: c.title, description: c.blurb } : {};
}

export default async function ChapterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const Content = CHAPTER_CONTENT[slug];
  if (!Content) notFound();
  return <Content />;
}
