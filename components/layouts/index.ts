// The registry. collections.layout is a string in the database; this turns it
// into a component. Adding a LAYOUT means adding a line here. Adding a
// COLLECTION means adding a database row and touching no file at all.
import type { ComponentType } from 'react'
import type { Layout, LayoutProps } from '@/lib/types'
import Feature from './Feature'
import Grid from './Grid'
import List from './List'
import Gallery from './Gallery'

export const LAYOUTS: Partial<Record<Layout, ComponentType<LayoutProps>>> = {
  feature: Feature,
  grid: Grid,
  list: List,
  gallery: Gallery,
  // prose, timeline and index arrive in phase c.
}

export function layoutFor(layout: Layout): ComponentType<LayoutProps> | null {
  return LAYOUTS[layout] ?? null
}
