import Image from 'next/image'
import { toEmbed } from '@/lib/embed'
import type { Media } from '@/lib/types'

/** A 16:9 video player for an 'embed' media row. Returns null if unparseable. */
export function EmbedPlayer({ media }: { media: Media }) {
  const embed = toEmbed(media.url)
  if (!embed) return null
  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '16 / 9' }}>
      <iframe
        src={embed.src}
        title={embed.title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
  )
}

/**
 * A cover image. `fill` makes it cover its parent, so the parent must be
 * positioned and sized — every caller wraps it in an aspect-ratio box.
 * `sizes` tells Next which widths to generate, which is what keeps a phone
 * on cellular from downloading a desktop-sized image.
 */
export function Cover({ media, sizes, priority = false }: {
  media: Media
  sizes: string
  priority?: boolean
}) {
  return (
    <Image
      src={media.url}
      alt={media.caption ?? ''}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  )
}

/** Small text link for a 'file' media row — a score PDF, a stem, a zip. */
export function FileLink({ media }: { media: Media }) {
  return (
    <a
      href={media.url}
      className="text-sm text-dim underline underline-offset-4 hover:text-accent"
    >
      {media.caption ?? 'Download'}
    </a>
  )
}

/** The one renderer the feature layout wants: an embed if there is one, else a cover. */
export function leadMedia(media: Media[]): Media | null {
  return media.find((m) => m.kind === 'embed') ?? media.find((m) => m.kind === 'image') ?? null
}
