// Hand-written marks, not an icon library — the brief rules out dependencies
// and stock icon sets, and three glyphs do not justify either.
//
// All three share one construction: a rounded outline at stroke-width 1.9 on a
// 24-unit grid, with at most one small filled detail. That consistency is what
// lets them sit in a row next to a plain text link without looking accidental.
//
// GitHub is deliberately absent. Its octocat is too intricate to redraw
// faithfully from memory, and an approximation would look worse than the word.

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false,
}

export function YouTubeIcon({ size = 21 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="2" y="5" width="20" height="14" rx="4.2" />
      <path d="M10.3 9.4 L15.5 12 L10.3 14.6 Z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function InstagramIcon({ size = 21 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.1" />
      <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function MailIcon({ size = 21 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.4" />
      <path d="M3.4 7.2 L12 13.3 L20.6 7.2" />
    </svg>
  )
}

/**
 * The one place that knows which mark belongs to which service. Both the hero
 * and every item link go through this, so pasting a YouTube URL into /admin
 * gets the logo with no code change — and teaching the site a new service is
 * one line here rather than an edit in each place links are drawn.
 *
 * Returning null is a real answer: GitHub has no mark here on purpose, and an
 * unknown host should simply render as text.
 */
export function iconForUrl(url: string): ((p: { size?: number }) => React.ReactElement) | null {
  let host: string
  try {
    const u = new URL(url)
    if (u.protocol === 'mailto:') return MailIcon
    host = u.hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return url.startsWith('mailto:') ? MailIcon : null
  }
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') return YouTubeIcon
  if (host === 'instagram.com') return InstagramIcon
  if (host === 'spotify.com' || host === 'open.spotify.com') return SpotifyIcon
  return null
}

export function SunIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6" />
    </svg>
  )
}

export function MoonIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size}>
      <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />
    </svg>
  )
}

export function SpotifyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg {...base} width={size} height={size}>
      <circle cx="12" cy="12" r="9.4" />
      {/* The three arcs, tightening as they go down, are the whole mark. */}
      <path d="M7.1 9.3c3.2-0.9 6.8-0.5 9.6 1.1" />
      <path d="M7.8 12.4c2.6-0.7 5.6-0.4 8 1" />
      <path d="M8.6 15.3c2-0.5 4.3-0.3 6.2 0.8" />
    </svg>
  )
}
