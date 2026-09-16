// A small, self-contained line-icon set so the Practice Dashboard doesn't
// need an external icon library. Consistent 20x20 viewBox, stroke-based.

const paths = {
  search: 'M9 16a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM19 19l-4.3-4.3',
  bell: 'M5 8a5 5 0 0 1 10 0c0 4 1.5 5.5 1.5 5.5h-13S5 12 5 8ZM8.3 16.5a1.7 1.7 0 0 0 3.4 0',
  chevronDown: 'm5 7.5 5 5 5-5',
  menu: 'M3 5.5h14M3 10h14M3 14.5h14',
  close: 'M5 5l10 10M15 5 5 15',
  clients: 'M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 17c0-3 2.5-5 5-5s5 2 5 5M13.5 4.3A3 3 0 0 1 14 10M14.5 12c2 .3 3.5 1.9 3.5 4',
  invoice: 'M5 2.5h8.5L17 6v11.5H5V2.5ZM7.5 9h5M7.5 12h5M13.5 2.5V6H17',
  wallet: 'M2.5 6a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2V6ZM13 10.5h3.5v3H13a1.5 1.5 0 0 1 0-3Z',
  trending: 'm3 13 5-5 3 3 6-6M13 5h4v4',
  profit: 'M10 2v16M14.5 5.5c0-1.7-2-3-4.5-3S5.5 3.8 5.5 5.5 7.5 8 10 8s4.5 1.3 4.5 3-2 3-4.5 3-4.5-1.3-4.5-3',
  bank: 'M2.5 8 10 3l7.5 5M3.5 8v7.5M7 8v7.5M13 8v7.5M16.5 8v7.5M2 17.5h16',
  services: 'M6 4.5h8v11l-4-2.3-4 2.3v-11Z',
  billing: 'M2.5 5.5h15v9h-15v-9ZM2.5 8.5h15M5.5 12.5h3',
  accounting: 'M4 3h12v14H4V3ZM7 6.5h6M7 9.5h2.5M12 9.5h1M7 12.5h2.5M12 12.5h1',
  reports: 'M4 17V9M9 17V3M14 17v-6',
  tasks: 'm4 10 3 3 9-9M4 16h12',
  documents: 'M6 2.5h6l3 3V17H6V2.5ZM12 2.5V6h3M8 10h4M8 13h4',
  settings: 'M10 12.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6ZM16 10c0 .4 0 .8-.1 1.2l1.6 1.2-1.5 2.6-1.9-.6a6 6 0 0 1-2 1.2l-.3 2H8.2l-.3-2a6 6 0 0 1-2-1.2l-1.9.6-1.5-2.6L4.1 11a5 5 0 0 1 0-2L2.5 7.8 4 5.2l1.9.6a6 6 0 0 1 2-1.2l.3-2h3.6l.3 2a6 6 0 0 1 2 1.2l1.9-.6 1.5 2.6L16 9c.1.3.1.6.1 1Z',
  overview: 'M3 10 10 3l7 7M5 8.5V17h10V8.5',
  plus: 'M10 4v12M4 10h12',
  print: 'M6 8V3h8v5M4.5 8h11a1.5 1.5 0 0 1 1.5 1.5V14h-3M4.5 8A1.5 1.5 0 0 0 3 9.5V14h3M6 12h8v5H6v-5Z',
  download: 'M10 3v10m0 0 4-4m-4 4-4-4M3.5 16.5h13',
  filter: 'M3 4.5h14L11 11v4l-2 1v-5L3 4.5Z',
  arrowUp: 'M10 15V5m0 0-4 4m4-4 4 4',
  arrowDown: 'M10 5v10m0 0-4-4m4 4 4-4',
  warning: 'M10 3 2.5 16h15L10 3ZM10 8v3.5M10 14h.01',
  check: 'M4 10.5l4 4L16 6',
  alert: 'M10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM10 6.5V10M10 13h.01',
  inbox: 'M3 8.5h4l1.5 2.5h3L13 8.5h4M3 8.5 4.5 3h11L17 8.5M3 8.5V16h14V8.5',
}

export default function Icon({ name, size = 18, strokeWidth = 1.7, className = '' }) {
  const d = paths[name]
  if (!d) return null
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}
