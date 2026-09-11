import type { Collection } from './types'

type Flags = Pick<Collection, 'layout' | 'mediaMode' | 'showYear' | 'columns'>

/**
 * Flag combinations worth telling Orr about in /admin, in plain words.
 * `blocking` means the collection would render nothing at all.
 */
export function collectionWarnings(c: Flags): { text: string; blocking: boolean }[] {
  const out: { text: string; blocking: boolean }[] = []

  if (c.layout === 'gallery' && c.mediaMode === 'none') {
    out.push({
      blocking: true,
      text: 'A gallery is nothing but images, and media is turned off — this will show an empty page. Set media to "cover".',
    })
  }

  if (c.layout === 'timeline' && !c.showYear) {
    out.push({
      blocking: false,
      text: 'A timeline without years is just a list. Turn the year on, or pick the list layout instead.',
    })
  }

  if (c.layout === 'index' && c.mediaMode !== 'none') {
    out.push({
      blocking: false,
      text: 'An index never shows media, so this setting will not do anything here.',
    })
  }

  if (c.columns > 1 && c.layout !== 'grid' && c.layout !== 'gallery') {
    out.push({
      blocking: false,
      text: 'Columns only affect the grid and gallery layouts.',
    })
  }

  return out
}
