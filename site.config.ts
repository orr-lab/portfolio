/**
 * Everything about whose site this is.
 *
 * This file is the only one a fork needs to edit. Nothing else in the codebase
 * mentions a name, a domain or a social account — if you find one that does,
 * it is a bug.
 *
 * Your actual work does not live here. That goes in /admin, because adding a
 * piece of work should never mean editing code or deploying.
 */
export const site = {
  /** Shown in the hero, the nav bar and every page title. */
  name: 'Orr Knaan',

  /** One line under the name. Keep it short and factual. */
  tagline: 'I make things across film, music, code and drawing.',

  /** Used for absolute URLs in link previews, and shown as a hint in /admin. */
  url: 'https://orrknaan.com',

  /**
   * Where else to find you, in the order they should appear.
   *
   * Any URL works, including `mailto:`. A service the site recognises shows its
   * mark; anything else shows its name as text. Teaching it a new service is
   * one line in components/Icons.tsx — and deliberately not every service:
   * GitHub has no mark because its octocat cannot be drawn faithfully by hand,
   * so it renders as the word instead. That fallback is the normal case, not a
   * failure.
   */
  links: [
    'https://www.youtube.com/@orrknaan',
    'https://www.instagram.com/orrknaan/',
    'mailto:orrknaan@gmail.com',
    'https://github.com/orr-lab',
  ],

  /**
   * A full-bleed photo at the foot of the home page. Replace
   * public/portrait.jpg with your own, or set enabled to false to drop it.
   */
  portrait: {
    enabled: true,
    alt: 'Orr Knaan walking a mountain path, with a wooded valley and snow-covered peaks behind.',
  },
} as const

/** The bare host, for places that want "example.com/films" rather than a URL. */
export function siteHost(): string {
  try {
    return new URL(site.url).hostname.replace(/^www\./, '')
  } catch {
    return site.url
  }
}
