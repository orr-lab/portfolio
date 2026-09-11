'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Collection } from '@/lib/types'

type Props = {
  collections: Collection[]
  /** 'hub' jumps to sections on the same page; 'page' navigates to them. */
  mode: 'hub' | 'page'
  activeSlug?: string
}

/**
 * Built entirely from the collections table — adding a collection puts a link
 * here with no code change, which is invariant 2 showing up in the navigation.
 */
export default function NavBar({ collections, mode, activeSlug }: Props) {
  // On a collection or work page there is no hero to scroll past, so the bar
  // is there from the start.
  const [shown, setShown] = useState(mode === 'page')
  const [banded, setBanded] = useState<string | null>(null)
  // The last section is usually too short to reach the detection band before
  // the page runs out of scroll, so it would never light up on its own.
  const [atEnd, setAtEnd] = useState(false)

  const active = mode === 'page'
    ? activeSlug ?? null
    : atEnd
      ? collections[collections.length - 1]?.slug ?? banded
      : banded

  useEffect(() => {
    if (mode !== 'hub') return

    // IntersectionObserver reports when an element enters or leaves a region,
    // which the browser computes itself — far cheaper than a scroll handler
    // that runs on every pixel.
    const sentinel = document.getElementById('hero-sentinel')
    const showObserver = new IntersectionObserver(
      ([entry]) => setShown(!entry.isIntersecting),
      { threshold: 0 },
    )
    if (sentinel) showObserver.observe(sentinel)

    // A band near the top of the viewport. Whichever section is crossing it is
    // the one being read.
    const seen = new Set<string>()
    const activeObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) seen.add(entry.target.id)
          else seen.delete(entry.target.id)
        }
        // Document order, so overlapping sections resolve to the higher one.
        const first = collections.find((c) => seen.has(c.slug))
        if (first) setBanded(first.slug)
      },
      { rootMargin: '-12% 0px -70% 0px', threshold: 0 },
    )
    for (const c of collections) {
      const el = document.getElementById(c.slug)
      if (el) activeObserver.observe(el)
    }

    // Once the end of the last section is on screen, that section is what is
    // being read, whatever the band says.
    const end = document.getElementById('sections-end')
    const endObserver = new IntersectionObserver(
      ([entry]) => setAtEnd(entry.isIntersecting),
      { threshold: 0 },
    )
    if (end) endObserver.observe(end)

    return () => {
      showObserver.disconnect()
      activeObserver.disconnect()
      endObserver.disconnect()
    }
  }, [mode, collections])

  return (
    <div
      className={`fixed top-0 right-0 left-0 z-40 border-b border-rule bg-bg/90 backdrop-blur transition-opacity duration-200 ${
        shown ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-3 sm:px-8">
        <Link href="/" className="shrink-0 text-sm tracking-tight hover:text-accent">
          Orr Knaan
        </Link>
        {/* One horizontally scrollable row on a phone. Never a hamburger. */}
        <nav className="-mx-2 flex flex-1 gap-4 overflow-x-auto px-2 sm:justify-end [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {collections.map((c) => (
            <a
              key={c.id}
              href={mode === 'hub' ? `#${c.slug}` : `/${c.slug}`}
              className={`shrink-0 text-sm whitespace-nowrap transition-colors ${
                active === c.slug ? 'text-accent' : 'text-dim hover:text-fg'
              }`}
              aria-current={active === c.slug ? 'true' : undefined}
            >
              {c.title}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}
