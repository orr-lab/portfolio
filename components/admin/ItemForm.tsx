'use client'

import { useActionState, useRef, useState } from 'react'
import { saveItem, type SaveState } from '@/app/admin/actions'
import { slugify } from '@/lib/slug'
import type { Collection } from '@/lib/types'
import type { AdminItem } from '@/lib/admin'
import { Field, inputClass } from './Field'

type Values = Record<
  'collectionId' | 'title' | 'slug' | 'subtitle' | 'blurb' | 'body' |
  'year' | 'dateLabel' | 'tags' | 'url' | 'urlLabel',
  string
>

export default function ItemForm({
  item, collections, defaultCollectionId,
}: {
  item: AdminItem | null
  collections: Collection[]
  defaultCollectionId?: string
}) {
  // useActionState runs the server action and hands back whatever it returned.
  // `pending` is true while the request is in flight.
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveItem, null)

  // Every field is "controlled": its value lives in React state rather than in
  // the DOM. That is what guarantees a rejected save cannot wipe the form —
  // losing a long body to a slug complaint would be unforgivable on a phone.
  const [v, setV] = useState<Values>({
    collectionId: item?.collectionId ?? defaultCollectionId ?? collections[0]?.id ?? '',
    title: item?.title ?? '',
    slug: item?.slug ?? '',
    subtitle: item?.subtitle ?? '',
    blurb: item?.blurb ?? '',
    body: item?.body ?? '',
    year: item?.year?.toString() ?? '',
    dateLabel: item?.dateLabel ?? '',
    tags: item?.tags.join(', ') ?? '',
    url: item?.url ?? '',
    urlLabel: item?.urlLabel ?? '',
  })

  const set = (key: keyof Values) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setV((s) => ({ ...s, [key]: e.target.value }))

  // Once the slug has been typed by hand, stop overwriting it from the title.
  const slugEdited = useRef(Boolean(item?.slug))

  return (
    <form action={formAction} className="pb-4">
      <input type="hidden" name="id" value={item?.id ?? 'new'} />

      <Field label="Collection">
        <select name="collectionId" value={v.collectionId} onChange={set('collectionId')}
                required className={inputClass}>
          {collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
      </Field>

      <Field label="Title">
        <input
          name="title"
          value={v.title}
          required
          autoCapitalize="sentences"
          className={inputClass}
          onChange={(e) => {
            const title = e.target.value
            setV((s) => ({
              ...s,
              title,
              slug: slugEdited.current ? s.slug : slugify(title),
            }))
          }}
        />
      </Field>

      <Field
        label="Slug"
        hint={
          v.slug
            ? `/work/${v.slug}`
            : v.title.trim()
              ? 'That title has no Latin letters, so type a slug by hand.'
              : 'Filled in from the title.'
        }
      >
        <input
          name="slug"
          value={v.slug}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          className={inputClass}
          onChange={(e) => { slugEdited.current = true; set('slug')(e) }}
        />
      </Field>

      <Field label="Subtitle" hint="A Hebrew title, “arr. for piano”, “Film group”">
        <input name="subtitle" value={v.subtitle} onChange={set('subtitle')} className={inputClass} />
      </Field>

      <Field label="Blurb" hint="One or two sentences. Shown on cards and listings.">
        <textarea name="blurb" rows={3} value={v.blurb} onChange={set('blurb')} className={inputClass} />
      </Field>

      <Field label="Body" hint="Markdown. Leaving this empty means the item has no page of its own.">
        <textarea name="body" rows={10} value={v.body} onChange={set('body')} className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Year" hint="Sorts by this">
          <input name="year" value={v.year} onChange={set('year')} inputMode="numeric" className={inputClass} />
        </Field>
        <Field label="Date shown" hint="Overrides the year">
          <input name="dateLabel" value={v.dateLabel} onChange={set('dateLabel')}
                 placeholder="2016–2020" className={inputClass} />
        </Field>
      </div>

      <Field label="Tags" hint="Comma separated">
        <input name="tags" value={v.tags} onChange={set('tags')} autoCapitalize="off" className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Link">
          <input name="url" value={v.url} onChange={set('url')} inputMode="url"
                 autoCapitalize="off" className={inputClass} />
        </Field>
        <Field label="Link label">
          <input name="urlLabel" value={v.urlLabel} onChange={set('urlLabel')} className={inputClass} />
        </Field>
      </div>

      {/* Sticky, so the save button stays in reach however long the body gets.
          The whole point of /admin is that it works one-handed. */}
      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-rule bg-bg/95 px-4 py-3 backdrop-blur">
        {state?.error && <p className="mb-2 text-sm text-accent">{state.error}</p>}
        <button type="submit" disabled={pending}
                className="min-h-12 w-full border border-accent text-base text-accent disabled:opacity-50">
          {pending ? 'Saving…' : item ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  )
}
