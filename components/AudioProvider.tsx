'use client'

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react'

export type Track = {
  id: string
  url: string
  title: string
  /** Length measured at upload, so a duration exists before anything loads. */
  duration: number | null
  /** Where the piece lives, so the bar can lead back to it. */
  href: string | null
}

type AudioState = {
  current: Track | null
  playing: boolean
  at: number
  length: number
  play: (track: Track) => void
  toggle: () => void
  seek: (seconds: number) => void
  stop: () => void
}

const Ctx = createContext<AudioState | null>(null)

export function useAudio(): AudioState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>')
  return ctx
}

/**
 * Holds the one <audio> element for the whole site.
 *
 * This lives in the root layout, and client-side navigation never unmounts the
 * root layout — so the element, and whatever it is playing, survives moving
 * between pages. Every per-track player on the site is a remote control for
 * this one element rather than an element of its own.
 *
 * A full page load still stops the music: following a link off the site, or a
 * hard refresh, tears down the whole document. Nothing can survive that.
 */
export default function AudioProvider({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState<Track | null>(null)
  const [playing, setPlaying] = useState(false)
  const [at, setAt] = useState(0)
  const [length, setLength] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onTime = () => setAt(el.currentTime)
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
  }, [])

  // The bar occupies real space at the top of the screen, and the nav bar sits
  // below it. Publishing its height as a variable lets the nav and the anchor
  // offsets follow without either knowing anything about audio.
  useEffect(() => {
    document.documentElement.style.setProperty('--player-h', current ? '3.25rem' : '0px')
  }, [current])

  const play = useCallback((track: Track) => {
    const el = ref.current
    if (!el) return
    if (current?.id === track.id) {
      void el.play()
      return
    }
    setCurrent(track)
    setAt(0)
    setLength(track.duration ?? 0)
    el.src = track.url
    void el.play()
  }, [current])

  const toggle = useCallback(() => {
    const el = ref.current
    if (!el || !current) return
    if (el.paused) void el.play()
    else el.pause()
  }, [current])

  const seek = useCallback((seconds: number) => {
    const el = ref.current
    if (el && Number.isFinite(seconds)) {
      el.currentTime = seconds
      setAt(seconds)
    }
  }, [])

  const stop = useCallback(() => {
    const el = ref.current
    if (el) { el.pause(); el.removeAttribute('src'); el.load() }
    setCurrent(null)
    setPlaying(false)
    setAt(0)
  }, [])

  const value = useMemo(
    () => ({ current, playing, at, length, play, toggle, seek, stop }),
    [current, playing, at, length, play, toggle, seek, stop],
  )

  return (
    <Ctx.Provider value={value}>
      {/* preload="none": nothing is fetched until a track is chosen. */}
      <audio ref={ref} preload="none" />
      {children}
    </Ctx.Provider>
  )
}
