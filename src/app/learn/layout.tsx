import { BgArt } from '@/components/BgArt';
import { ChapterNav } from '@/components/ChapterNav';

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <BgArt variant="subtle" />
      <div className="learn">
        <aside className="sidebar glass" aria-label="Course contents" data-scroll="y">
          <ChapterNav />
        </aside>
        <div style={{ minWidth: 0 }}>{children}</div>
      </div>
    </>
  );
}
