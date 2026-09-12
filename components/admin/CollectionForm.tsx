'use client'

import { useActionState, useRef, useState } from 'react'
import { saveCollection, type SaveState } from '@/app/admin/actions'
import { LAYOUTS, LAYOUT_DESCRIPTIONS } from '@/components/layouts'
import { collectionWarnings } from '@/lib/validation'
import { slugify } from '@/lib/slug'
import type { Collection, Density, Item, Layout, MediaMode, SortMode } from '@/lib/types'
import { Field, inputClass } from './Field'
import { siteHost } from '@/site.config'

const LAYOUT_ORDER: Layout[] = ['feature', 'grid', 'list', 'gallery', 'prose', 'timeline', 'index']

const SORT_WORDS: Record<SortMode, string> = {
  manual: 'The order I put them in',
  year_desc: 'Newest first',
  year_asc: 'Oldest first',
  alpha: 'By title, A to Z',
}
const MEDIA_WORDS: Record<MediaMode, string> = {
  cover: 'Show a picture',
  player: 'Play audio or video in place',
  none: 'No pictures — text only',
}
const DENSITY_WORDS: Record<Density, string> = {
  comfortable: 'Roomy',
  compact: 'Tight',
}

export default function CollectionForm({
  collection, previewItems,
}: {
  collection: Collection | null
  previewItems: Item[]
}) {
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveCollection, null)

  const [v, setV] = useState({
    title: collection?.title ?? '',
    slug: collection?.slug ?? '',
    blurb: collection?.blurb ?? '',
    layout: (collection?.layout ?? 'grid') as Layout,
    columns: String(collection?.columns ?? 2),
    showYear: collection?.showYear ?? true,
    showTags: collection?.showTags ?? false,
    showBlurb: collection?.showBlurb ?? true,
    mediaMode: (collection?.mediaMode ?? 'cover') as MediaMode,
    sortMode: (collection?.sortMode ?? 'manual') as SortMode,
    density: (collection?.density ?? 'comfortable') as Density,
    itemNounPlural: collection?.itemNounPlural ?? '',
    visible: collection?.visible ?? true,
  })
  const slugEdited = useRef(Boolean(collection?.slug))

  const text = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setV((s) => ({ ...s, [k]: e.target.value }))
  const check = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((s) => ({ ...s, [k]: e.target.checked }))

  // The preview is built from the pending values, not the saved ones, so a flag
  // change shows its effect before anything is written.
  const pendingCollection: Collection = {
    id: collection?.id ?? 'preview',
    slug: v.slug || 'preview',
    title: v.title,
    blurb: v.blurb || null,
    layout: v.layout,
    columns: (Number(v.columns) || 1) as 1 | 2 | 3,
    showYear: v.showYear,
    showTags: v.showTags,
    showBlurb: v.showBlurb,
    mediaMode: v.mediaMode,
    sortMode: v.sortMode,
    density: v.density,
    itemNounPlural: v.itemNounPlural || null,
    sortOrder: collection?.sortOrder ?? 0,
    visible: v.visible,
  }

  const Preview = LAYOUTS[v.layout]
  const warnings = collectionWarnings(pendingCollection)

  return (
    <>
      <form action={formAction} className="pb-4">
        <input type="hidden" name="id" value={collection?.id ?? 'new'} />

        <Field label="Title">
          <input
            name="title"
            value={v.title}
            required
            className={inputClass}
            onChange={(e) => {
              const title = e.target.value
              setV((s) => ({ ...s, title, slug: slugEdited.current ? s.slug : slugify(title) }))
            }}
          />
        </Field>

        <Field label="Address" hint={v.slug ? `${siteHost()}/${v.slug}` : 'Filled in from the title.'}>
          <input
            name="slug"
            value={v.slug}
            inputMode="url"
            autoCapitalize="off"
            className={inputClass}
            onChange={(e) => { slugEdited.current = true; text('slug')(e) }}
          />
        </Field>

        <Field label="Blurb" hint="One line under the heading.">
          <input name="blurb" value={v.blurb} onChange={text('blurb')} className={inputClass} />
        </Field>

        <Field label="How it looks">
          <select name="layout" value={v.layout} onChange={text('layout')} className={inputClass}>
            {LAYOUT_ORDER.map((l) => <option key={l} value={l}>{LAYOUT_DESCRIPTIONS[l]}</option>)}
          </select>
        </Field>

        <Field label="Pictures">
          <select name="mediaMode" value={v.mediaMode} onChange={text('mediaMode')} className={inputClass}>
            {(Object.keys(MEDIA_WORDS) as MediaMode[]).map((m) => (
              <option key={m} value={m}>{MEDIA_WORDS[m]}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Order">
            <select name="sortMode" value={v.sortMode} onChange={text('sortMode')} className={inputClass}>
              {(Object.keys(SORT_WORDS) as SortMode[]).map((m) => (
                <option key={m} value={m}>{SORT_WORDS[m]}</option>
              ))}
            </select>
          </Field>
          <Field label="Spacing">
            <select name="density" value={v.density} onChange={text('density')} className={inputClass}>
              {(Object.keys(DENSITY_WORDS) as Density[]).map((m) => (
                <option key={m} value={m}>{DENSITY_WORDS[m]}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Columns" hint="Only affects the grid and gallery.">
          <select name="columns" value={v.columns} onChange={text('columns')} className={inputClass}>
            <option value="1">One</option>
            <option value="2">Two</option>
            <option value="3">Three</option>
          </select>
        </Field>

        <Field label="Plural word" hint={`For "All 14 ${v.itemNounPlural || 'items'} →"`}>
          <input name="itemNounPlural" value={v.itemNounPlural} onChange={text('itemNounPlural')}
                 placeholder="compositions" autoCapitalize="off" className={inputClass} />
        </Field>

        <fieldset className="mt-6">
          <legend className="text-sm text-dim">Show on each item</legend>
          {([
            ['showYear', 'The date'],
            ['showTags', 'Tags'],
            ['showBlurb', 'The blurb'],
            ['visible', 'Show this collection on the site at all'],
          ] as const).map(([key, label]) => (
            <label key={key} className="mt-1 flex min-h-11 items-center gap-3 text-base">
              <input type="checkbox" name={key} checked={v[key] as boolean}
                     onChange={check(key)} className="h-5 w-5" />
              {label}
            </label>
          ))}
        </fieldset>

        <div className="sticky bottom-0 -mx-4 mt-6 border-t border-rule bg-bg/95 px-4 py-3 backdrop-blur">
          {state?.error && <p className="mb-2 text-sm text-accent">{state.error}</p>}
          {warnings.map((w) => (
            <p key={w.text} className={`mb-2 text-xs ${w.blocking ? 'text-accent' : 'text-dim'}`}>
              {w.blocking ? '⚠ ' : ''}{w.text}
            </p>
          ))}
          <button type="submit" disabled={pending}
                  className="min-h-12 w-full border border-accent text-base text-accent disabled:opacity-50">
            {pending ? 'Saving…' : collection ? 'Save' : 'Create'}
          </button>
        </div>
      </form>

      <section className="mt-10 border-t border-rule pt-6">
        <h2 className="eyebrow">Preview</h2>
        <p className="mt-1 text-xs text-dim opacity-70">
          The first three items, drawn with the settings above — before saving.
        </p>
        <div className="mt-5">
          {previewItems.length === 0 ? (
            <p className="text-sm text-dim">
              Nothing published in this collection yet, so there is nothing to draw.
            </p>
          ) : (
            <Preview items={previewItems} collection={pendingCollection} />
          )}
        </div>
      </section>
    </>
  )
}
