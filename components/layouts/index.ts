// The registry. collections.layout is a string in the database; this turns it
// into a component. Adding a LAYOUT means adding a line here. Adding a
// COLLECTION means adding a database row and touching no file at all.
//
// Seven is the ceiling. Do not add an eighth without asking Orr.
import type { ComponentType } from 'react'
import type { Layout, LayoutProps } from '@/lib/types'
import Feature from './Feature'
import Grid from './Grid'
import List from './List'
import Gallery from './Gallery'
import Prose from './Prose'
import Timeline from './Timeline'
import IndexLayout from './IndexLayout'

export const LAYOUTS: Record<Layout, ComponentType<LayoutProps>> = {
  feature: Feature,
  grid: Grid,
  list: List,
  gallery: Gallery,
  prose: Prose,
  timeline: Timeline,
  index: IndexLayout,
}

/** What each layout is for, in words. /admin shows this, never the raw enum. */
export const LAYOUT_DESCRIPTIONS: Record<Layout, string> = {
  feature: 'One per row, full width, with a large player or cover. For films.',
  grid: 'Cards with a cover on top, a title and a blurb. For projects.',
  list: 'Compact rows with the date on the right. Stays readable at forty items.',
  gallery: 'A wall of images with no titles or cards. Tapping one opens it larger.',
  prose: 'Title, date and the opening lines. No images, no cards. For writing.',
  timeline: 'Grouped under years on a vertical rail. For work where the order matters.',
  index: 'One line each, title left and date right. For credits and mentions.',
}

export function layoutFor(layout: Layout): ComponentType<LayoutProps> | null {
  return LAYOUTS[layout] ?? null
}
