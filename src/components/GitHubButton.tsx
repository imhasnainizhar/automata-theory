import { Icon } from './Icon';
import { site } from '@/lib/site';
import { formatStars } from '@/lib/github';

export function GitHubButton({ stars, size = 'md', label = 'GitHub' }: { stars: number | null; size?: 'sm' | 'md' | 'lg'; label?: string }) {
  const cls = `btn btn-glass${size === 'sm' ? ' btn-sm' : size === 'lg' ? ' btn-lg' : ''}`;
  return (
    <a className={cls} href={site.repoUrl} target="_blank" rel="noreferrer" aria-label={`${label} — ${stars ?? 'view'} stars`}>
      <Icon name="github" />
      <span>{label}</span>
      <Icon name="external" className="ext" />

      {stars !== null && (
        <span className="star-count" title={`${stars} stars on GitHub`}>
          <Icon name="star" />
          {formatStars(stars)}
        </span>
      )}
    </a>
  );
}
