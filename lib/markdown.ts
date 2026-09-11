// body is markdown. It is rendered on the server, so `marked` never reaches the
// browser. Only Orr can write a body, via /admin, so there is nothing hostile
// to sanitise — this is not user-submitted content.
import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })

export async function renderMarkdown(md: string): Promise<string> {
  return marked.parse(md) as string | Promise<string>
}
