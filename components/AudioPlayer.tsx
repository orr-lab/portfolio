'use client'

import { useAudio } from './AudioProvider'
import type { Media } from '@/lib/types'

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '–:––'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * The player shown on a track's own row. It owns no <audio> element of its own:
 * it asks the one in the root layout to play this track, and reads its state
 * back. That is what lets the music carry on when you open another page — and
 * it also means this row and the bar at the top can never disagree about
 * what is playing or where it has got to.
 */
export default function AudioPlayer({ media, title }: { media: Media; title: string }) {
  const { current, playing, at, length, play, toggle, seek } = useAudio()

  const isMine = current?.id === media.id
  const shownAt = isMine ? at : 0
  const shownLength = isMine && length ? length : (media.durationSeconds ?? 0)
  const progress = shownLength > 0 ? (shownAt / shownLength) * 100 : 0

  return (
    <div className="mt-3 max-w-md">
      {media.caption && <div className="mb-1.5 text-xs text-dim">{media.caption}</div>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (isMine) toggle()
            else play({ id: media.id, url: media.url, title, duration: media.durationSeconds })
          }}
          aria-label={isMine && playing ? `Pause ${title}` : `Play ${title}`}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-rule text-accent hover:border-accent"
        >
          {isMine && playing ? (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <rect x="2" y="1.5" width="3.5" height="11" />
              <rect x="8.5" y="1.5" width="3.5" height="11" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <path d="M3 1.5 L12 7 L3 12.5 Z" />
            </svg>
          )}
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <input
            type="range"
            min={0}
            max={shownLength || 0}
            step={0.1}
            value={shownAt}
            // Seeking a track that is not the one loaded would be meaningless.
            disabled={!isMine || !shownLength}
            aria-label="Seek"
            onChange={(e) => seek(Number(e.target.value))}
            className="audio-seek min-w-0 flex-1"
            style={{ ['--progress' as string]: `${progress}%` }}
          />
          <span className="shrink-0 text-xs text-dim tabular-nums">
            {clock(shownAt)} / {clock(shownLength)}
          </span>
        </div>
      </div>
    </div>
  )
}
