import type { ReactElement } from 'react';

export type IconName =
  | 'text'
  | 'textarea'
  | 'number'
  | 'date'
  | 'time'
  | 'datetime'
  | 'heading'
  | 'slider'
  | 'checkbox'
  | 'select'
  | 'radio'
  | 'vertical'
  | 'horizontal'
  | 'group'
  | 'tabs'
  | 'plus'
  | 'trash'
  | 'copy'
  | 'undo'
  | 'redo'
  | 'play'
  | 'pencil'
  | 'save'
  | 'folder'
  | 'download'
  | 'clipboard'
  | 'x'
  | 'chevron-down'
  | 'check'
  | 'search'
  | 'grip';

const paths: Record<IconName, ReactElement> = {
  text: <path d="M5 6h14M12 6v12" />,
  textarea: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 9h8M8 12h8M8 15h5" />
    </>
  ),
  number: <path d="M6 8.5h12M6 15.5h12M10 5l-1.5 14M15.5 5 14 19" />,
  date: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 4v4M15 4v4" />
    </>
  ),
  time: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l2.5 2.5" />
    </>
  ),
  datetime: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 4v4M15 4v4" />
      <path d="M12 12v3l2 1.5" />
    </>
  ),
  heading: <path d="M6 5v14M18 5v14M6 12h12" />,
  slider: (
    <>
      <path d="M4 12h16" />
      <circle cx="14" cy="12" r="3" />
    </>
  ),
  checkbox: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="3" />
      <path d="M9 12l2.5 2.5L16 9.5" />
    </>
  ),
  select: (
    <>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="M16 11l-2 2-2-2" />
    </>
  ),
  radio: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
    </>
  ),
  vertical: (
    <>
      <rect x="6" y="4" width="12" height="6" rx="1" />
      <rect x="6" y="14" width="12" height="6" rx="1" />
    </>
  ),
  horizontal: (
    <>
      <rect x="4" y="8" width="7" height="8" rx="1" />
      <rect x="13" y="8" width="7" height="8" rx="1" />
    </>
  ),
  group: (
    <>
      <rect x="4" y="6" width="16" height="14" rx="2" />
      <path d="M8 10h8" />
    </>
  ),
  tabs: (
    <>
      <path d="M4 10h5V6h4v4h7" />
      <rect x="4" y="10" width="16" height="9" rx="1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />,
  copy: (
    <>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15V6a2 2 0 012-2h9" />
    </>
  ),
  undo: <path d="M8 5L3 10l5 5M3 10h11a6 6 0 016 6v3" />,
  redo: <path d="M16 5l5 5-5 5M21 10H10a6 6 0 00-6 6v3" />,
  play: <path d="M7 5l12 7-12 7V5z" />,
  pencil: <path d="M4 20h4L20 8l-4-4L4 16v4z" />,
  save: (
    <>
      <path d="M5 4h11l4 4v12H5V4z" />
      <path d="M8 4v5h7V4M8 20v-6h8v6" />
    </>
  ),
  folder: (
    <path d="M4 6a2 2 0 012-2h4l2 2h6a2 2 0 012 2v9a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
  ),
  download: (
    <>
      <path d="M12 4v10M8 10l4 4 4-4" />
      <path d="M5 19h14" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="6" width="12" height="14" rx="2" />
      <path d="M9 6V4h6v2" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6L6 18" />,
  'chevron-down': <path d="M6 9l6 6 6-6" />,
  check: <path d="M5 13l4 4L19 7" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="M20 20l-4-4" />
    </>
  ),
  grip: (
    <>
      <circle cx="9" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="6" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="12" r="1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="18" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="18" r="1" fill="currentColor" stroke="none" />
    </>
  ),
};

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-4 w-4'}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
