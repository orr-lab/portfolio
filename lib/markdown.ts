// body is markdown. It is rendered on the server, so `marked` never reaches the
// browser. Only Orr can write a body, via /admin, so there is nothing hostile
// to sanitise — this is not user-submitted content.
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })

export async function renderMarkdown(md: string): Promise<string> {
  return marked.parse(md) as string | Promise<string>
}

/**
 * The first line or two of a body as plain text, for the prose layout.
 * Strips markdown rather than rendering it, so no tags leak into a preview.
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
