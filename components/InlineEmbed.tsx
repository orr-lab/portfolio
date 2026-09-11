'use client'

import { useState } from 'react'
import { toEmbed } from '@/lib/embed'

/**
 * A YouTube/Vimeo row in a list.
 *
 * `eager` shows the player straight away, which is what a short list wants —
 * making someone tap to reveal a player when there is only one composition on
 * screen is pointless ceremony. A long list flips to click-to-play so that
 * forty compositions load forty buttons instead of forty iframes. List.tsx
 * decides which, by counting.
 *
 * Playback stops on navigation, which is the trade the brief accepted.
 */
export default function InlineEmbed(
  { url, label, eager = false }: { url: string; label: string | null; eager?: boolean },
) {
  const [playing, setPlaying] = useState(false)
  const embed = toEmbed(url)
  if (!embed) return null

  if (eager) {
    return (
      <div className="mt-3 w-full max-w-md overflow-hidden bg-black" style={{ aspectRatio: '16 / 9' }}>
        <iframe
          // No autoplay: the page loading is not a request to start making noise.
          src={`${embed.src}?rel=0`}
          title={label ?? embed.title}
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="h-full w-full border-0"
        />
      </div>
    )
  }

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
