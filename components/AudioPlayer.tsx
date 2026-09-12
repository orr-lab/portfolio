'use client'

import { useEffect, useRef, useState } from 'react'
import type { Media } from '@/lib/types'

function clock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '–:––'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/**
 * A player built from an <audio> element with its own controls hidden. The
 * native ones cannot be styled and look different in every browser; this is the
 * same element underneath, so playback, seeking and the OS media keys all still
 * work — only the buttons are ours.
 *
 * Still deliberately not persistent across pages: music stops on navigation,
 * which is the trade the brief accepted.
 */
export default function AudioPlayer({ media }: { media: Media }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [at, setAt] = useState(0)
  // The length measured at upload, so the number is there before anything is
  // downloaded. The file itself corrects it once it loads.
  const [length, setLength] = useState(media.durationSeconds ?? 0)
  const [scrubbing, setScrubbing] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onTime = () => { if (!scrubbing) setAt(el.currentTime) }
    const onMeta = () => { if (Number.isFinite(el.duration)) setLength(el.duration) }
    const onPlay = () => setPlaying(true)
    const onPause = () => setPlaying(false)
    const onEnd = () => { setPlaying(false); setAt(0) }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    el.addEventListener('ended', onEnd)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('ended', onEnd)
    }
  }, [scrubbing])

  function toggle() {
    const el = ref.current
    if (!el) return
    if (el.paused) void el.play()
    else el.pause()
  }

  function seek(to: number) {
    const el = ref.current
    if (el && Number.isFinite(to)) {
      el.currentTime = to
      setAt(to)
    }
  }

  const progress = length > 0 ? (at / length) * 100 : 0

  return (
    <div className="mt-3 max-w-md">
      {media.caption && <div className="mb-1.5 text-xs text-dim">{media.caption}</div>}

      {/* preload="none": nothing is fetched until someone presses play, which is
          what keeps a list of forty compositions light. */}
      <audio ref={ref} src={media.url} preload="none" />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? 'Pause' : 'Play'}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center border border-rule text-accent hover:border-accent"
        >
          {playing ? (
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
          {/* A range input rather than a styled div: it is seekable by keyboard
              and announced properly, which a div would not be. */}
          <input
            type="range"
            min={0}
            max={length || 0}
            step={0.1}
            value={at}
            disabled={!length}
            aria-label="Seek"
            onPointerDown={() => setScrubbing(true)}
            onPointerUp={() => setScrubbing(false)}
            onChange={(e) => { setAt(Number(e.target.value)); if (!scrubbing) seek(Number(e.target.value)) }}
            onMouseUp={(e) => seek(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => seek(Number((e.target as HTMLInputElement).value))}
            onKeyUp={(e) => seek(Number((e.target as HTMLInputElement).value))}
            className="audio-seek min-w-0 flex-1"
            style={{ ['--progress' as string]: `${progress}%` }}
          />
          <span className="shrink-0 text-xs text-dim tabular-nums">
            {clock(at)} / {clock(length)}
          </span>
        </div>
      </div>
    </div>
  )
}
