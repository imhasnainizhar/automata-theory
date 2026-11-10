import type { SVGProps } from 'react';

const paths = {
  // chapter icons
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13.4 13.4 8.5 15.5l2.1-4.9z" />
    </>
  ),
  sigma: <path d="M17 5H7l6 7-6 7h10" />,
  sprout: (
    <>
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-6.5 7-6.5 0 4-3 6.5-7 6.5Z" />
      <path d="M12 14.5c0-3.2-2.4-5.2-6-5.2 0 3.2 2.4 5.2 6 5.2Z" />
    </>
  ),
  dfa: (
    <>
      <circle cx="6" cy="12" r="3.2" />
      <circle cx="18" cy="12" r="3.2" />
      <circle cx="18" cy="12" r="1.6" />
      <path d="M9.4 12h5" />
      <path d="m12.8 10.4 1.6 1.6-1.6 1.6" />
    </>
  ),
  nfa: (
    <>
      <circle cx="5.5" cy="12" r="2.8" />
      <circle cx="18.5" cy="6" r="2.6" />
      <circle cx="18.5" cy="18" r="2.6" />
      <path d="M8.2 11 15.8 7" />
      <path d="M8.2 13 15.8 17" />
    </>
  ),
  stack: (
    <>
      <rect x="6" y="14.5" width="12" height="4.5" rx="1.4" />
      <rect x="6" y="8.5" width="12" height="4.5" rx="1.4" />
      <path d="M12 2.5v4" />
      <path d="m9.8 4.5 2.2 2.2 2.2-2.2" />
    </>
  ),
  stackTree: (
    <>
      <rect x="3" y="14.5" width="8" height="4.5" rx="1.3" />
      <rect x="13" y="14.5" width="8" height="4.5" rx="1.3" />
      <path d="M12 3.5v4.5" />
      <path d="M12 8 7 13" />
      <path d="M12 8l5 5" />
    </>
  ),
  bounded: (
    <>
      <path d="M4 7v10" />
      <path d="M20 7v10" />
      <rect x="7" y="9" width="4.5" height="6" rx="1" />
      <rect x="12.5" y="9" width="4.5" height="6" rx="1" />
    </>
  ),
  tape: (
    <>
      <path d="M2 9h20M2 15h20" />
      <path d="M7 9v6M12 9v6M17 9v6" />
      <path d="M12 3.5v3" />
      <path d="m10.3 5 1.7 1.7L13.7 5" />
    </>
  ),
  branch: (
    <>
      <circle cx="12" cy="4.5" r="2" />
      <circle cx="5.5" cy="19" r="2" />
      <circle cx="12" cy="19" r="2" />
      <circle cx="18.5" cy="19" r="2" />
      <path d="M12 6.5V17M11 6.3 6.3 17.2M13 6.3l4.7 10.9" />
    </>
  ),
  rings: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="13.5" r="6" />
      <circle cx="12" cy="15" r="3" />
    </>
  ),
  // ui
  menu: <path d="M4 8h16M4 16h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  arrowRight: <path d="M5 12h14m-5-5 5 5-5 5" />,
  arrowLeft: <path d="M19 12H5m5-5-5 5 5 5" />,
  external: <path d="M7 17 17 7M9 7h8v8" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  stepBack: (
    <>
      <path d="M18 5.5v13L9.5 12z" />
      <path d="M6 5v14" />
    </>
  ),
  skipBack: (
    <>
      <path d="M11.5 6v12L4 12z" />
      <path d="M20 6v12l-7.5-6z" />
    </>
  ),
  crosshair: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  expand: <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />,
  shrink: <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />,
  home: <path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z" />,
  book: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </>
  ),
  play: <path d="M8 5.5v13l10.5-6.5z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  step: (
    <>
      <path d="M6 5.5v13l8.5-6.5z" />
      <path d="M18 5v14" />
    </>
  ),
  reset: (
    <>
      <path d="M4 12a8 8 0 1 0 2.4-5.7" />
      <path d="M4 4.5v4h4" />
    </>
  ),
  bulb: (
    <>
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />
    </>
  ),
  ruler: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="1.5" />
      <path d="M7 8v3M11 8v4M15 8v3M19 8v2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  alert: (
    <>
      <path d="M12 4 2.8 19.5h18.4z" />
      <path d="M12 10v4.5M12 17.2v.1" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3h5M10.5 3v6L5 19a1.3 1.3 0 0 0 1.1 2h11.8a1.3 1.3 0 0 0 1.1-2l-5.5-10V3" />
      <path d="M7.5 14.5h9" />
    </>
  ),
  cpu: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
      <path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5" />
    </>
  ),
  github: (
    <path
      fill="currentColor"
      stroke="none"
      d="M12 .6a11.4 11.4 0 0 0-3.6 22.2c.6.1.8-.2.8-.6v-2c-3.2.7-3.8-1.4-3.8-1.4-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.5-.3-5.2-1.3-5.2-5.6 0-1.2.4-2.3 1.2-3.1-.1-.3-.5-1.4.1-3 0 0 1-.3 3.1 1.2a10.8 10.8 0 0 1 5.7 0c2.2-1.5 3.1-1.2 3.1-1.2.6 1.6.2 2.7.1 3 .8.8 1.2 1.9 1.2 3.1 0 4.4-2.7 5.3-5.2 5.6.4.4.8 1 .8 2.1v3.1c0 .3.2.7.8.6A11.4 11.4 0 0 0 12 .6z"
    />
  ),
  star: <path fill="currentColor" stroke="none" d="m12 2.8 2.8 5.8 6.3.8-4.6 4.4 1.2 6.3L12 17l-5.7 3.1 1.2-6.3-4.6-4.4 6.3-.8z" />,
} as const;

export type IconName = keyof typeof paths;

export function Icon({ name, ...rest }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}
