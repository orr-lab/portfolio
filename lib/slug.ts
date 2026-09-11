/** /[collection] lives at the site root, so these would shadow a collection. */
export const RESERVED_SLUGS = ['admin', 'work', 'api', '_next']

/**
 * Slugs are generated from the title only when it is Latin script. A Hebrew
 * title such as "בית טוב" yields '', and /admin then requires one to be typed
 * rather than inventing something unreadable.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function slugProblem(slug: string, kind: 'collection' | 'item'): string | null {
  if (!slug) return 'Needs a slug — the title has no Latin letters, so type one.'
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
    return 'Lowercase letters, numbers and hyphens only.'
  }
  if (kind === 'collection' && RESERVED_SLUGS.includes(slug)) {
    return `"${slug}" is reserved by the site and would make the collection unreachable.`
  }
  return null
}
