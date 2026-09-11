'use client'

import { useState } from 'react'
import { toEmbed } from '@/lib/embed'

/**
 * A YouTube/Vimeo row that costs nothing until it is tapped. Forty of these in
 * a list load forty buttons, not forty iframes; the player only exists after a
 * click. Playback stops on navigation, which is the trade the brief accepted.
 *
 * The player stays visible on purpose — hiding it to get audio-only playback
 * would breach YouTube's terms.
 */
export default function InlineEmbed({ url, label }: { url: string; label: string | null }) {
  const [playing, setPlaying] = useState(false)
  const embed = toEmbed(url)
  if (!embed) return null

  if (!playing) {
    return (
      <button
        type="button"
        onClick={() => setPlaying(true)}
        className="mt-2 inline-flex items-center gap-2 text-sm text-accent underline-offset-4 hover:underline"
      >
        <span aria-hidden>▶</span> {label ?? 'Play'}
      </button>
    )
  }

  return (
    <div className="mt-3 w-full max-w-md overflow-hidden bg-black" style={{ aspectRatio: '16 / 9' }}>
      <iframe
        // autoplay=1 is honoured here because the click counts as user intent.
        src={`${embed.src}?autoplay=1&rel=0`}
        title={label ?? embed.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    </div>
  )
}
