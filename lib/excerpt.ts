/**
 * The first line or two of a body as plain text, for the prose layout.
 *
 * Deliberately separate from lib/markdown.ts: this is pure string work, and
 * the prose layout is rendered inside /admin's live preview, which runs in the
 * browser. Importing it from the module that pulls in `marked` would ship the
 * whole markdown parser to every visitor for no reason.
 */
export function excerpt(md: string | null, max = 180): string {
  if (!md) return ''
  const text = md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/[*_`>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const space = cut.lastIndexOf(' ')
  return `${space > 0 ? cut.slice(0, space) : cut}…`
}
