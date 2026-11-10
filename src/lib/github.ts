import { site } from './site';

/** Star count for the repository, refreshed at most once per hour. Returns null when unavailable. */
export async function getStars(): Promise<number | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${site.repo}`, {
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'whatautomata-site' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === 'number' ? data.stargazers_count : null;
  } catch {
    return null;
  }
}

export function formatStars(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'k';
  return String(n);
}
