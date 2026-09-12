'use client'

import Link from 'next/link'
import { useAudio } from './AudioProvider'

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '–:––'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * The bar that appears at the top once something is playing and stays there
 * while you move around the site. It is the same element being controlled from
 * the row you pressed play on; both stay in step because both read the same
 * state.
 */
export default function NowPlaying() {
  const { current, playing, at, length, toggle, seek, stop } = useAudio()
  if (!current) return null

  const progress = length > 0 ? (at / length) * 100 : 0

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-rule bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-[3.25rem] max-w-4xl items-center gap-3 px-4 sm:px-8">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className="inline-flex h-11 w-9 shrink-0 items-center justify-center text-accent"
        >
          {playing ? (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <rect x="2" y="1.5" width="3.5" height="11" />
              <rect x="8.5" y="1.5" width="3.5" height="11" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor" aria-hidden>
              <path d="M3 1.5 L12 7 L3 12.5 Z" />
            </svg>
          )}
        </button>

        {/* Naming the piece without leading back to it is a dead end once you
            have wandered off to another page. */}
        {current.href ? (
          <Link
            href={current.href}
            className="min-w-0 shrink truncate text-sm underline-offset-4 hover:text-accent hover:underline"
          >
            {current.title}
          </Link>
        ) : (
          <span className="min-w-0 shrink truncate text-sm">{current.title}</span>
        )}

        <input
          type="range"
          min={0}
          max={length || 0}
          step={0.1}
          value={at}
          disabled={!length}
          aria-label="Seek"
          onChange={(e) => seek(Number(e.target.value))}
          className="audio-seek hidden min-w-0 flex-1 sm:block"
          style={{ ['--progress' as string]: `${progress}%` }}
        />

        <span className="ml-auto shrink-0 text-xs text-dim tabular-nums sm:ml-0">
          {clock(at)} / {clock(length)}
        </span>

        <button
          type="button"
          onClick={stop}
          aria-label="Stop and close the player"
          className="inline-flex h-11 w-9 shrink-0 items-center justify-center text-lg text-dim hover:text-accent"
        >
          ×
        </button>
      </div>
    </div>
  )
}
