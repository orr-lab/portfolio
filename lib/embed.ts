// Turns a pasted YouTube or Vimeo link into something an <iframe> can load.
// Orr pastes whatever the share button gave him; this normalises it.

export type Embed = { src: string; title: string }

export function toEmbed(url: string): Embed | null {
  let u: URL
  try {
    u = new URL(url.trim())
  } catch {
    return null
  }
  const host = u.hostname.replace(/^www\./, '')

  if (host === 'youtu.be') {
    const id = u.pathname.slice(1)
    return id ? { src: `https://www.youtube-nocookie.com/embed/${id}`, title: 'YouTube video' } : null
  }
  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const id = u.searchParams.get('v') ?? u.pathname.match(/\/(?:embed|shorts|live)\/([\w-]+)/)?.[1]
    return id ? { src: `https://www.youtube-nocookie.com/embed/${id}`, title: 'YouTube video' } : null
  }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const id = u.pathname.match(/(\d+)/)?.[1]
    return id ? { src: `https://player.vimeo.com/video/${id}`, title: 'Vimeo video' } : null
  }
  return null
}

/** True when /admin should accept this as an 'embed' media row. */
export function isEmbeddable(url: string): boolean {
  return toEmbed(url) !== null
}
