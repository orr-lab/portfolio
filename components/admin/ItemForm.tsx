'use client'

import { useActionState, useRef, useState } from 'react'
import { saveItem, type SaveState } from '@/app/admin/actions'
import { slugify } from '@/lib/slug'
import type { Collection } from '@/lib/types'
import type { AdminItem } from '@/lib/admin'
import { Field, inputClass } from './Field'

export default function ItemForm({
  item, collections, defaultCollectionId,
}: {
  item: AdminItem | null
  collections: Collection[]
  defaultCollectionId?: string
}) {
  // useActionState runs the server action and hands back whatever it returns.
  // On a validation error the typed values stay on screen, which matters when
  // the thing being typed is a long body on a phone. `pending` is true while
  // the request is in flight.
  const [state, formAction, pending] = useActionState<SaveState, FormData>(saveItem, null)

  const [title, setTitle] = useState(item?.title ?? '')
  const [slug, setSlug] = useState(item?.slug ?? '')
  // Once the slug has been typed in by hand, stop overwriting it.
  const slugEdited = useRef(Boolean(item?.slug))

  return (
    <form action={formAction} className="pb-4">
      <input type="hidden" name="id" value={item?.id ?? 'new'} />

      <Field label="Collection">
        <select
          name="collectionId"
          defaultValue={item?.collectionId ?? defaultCollectionId ?? ''}
          required
          className={inputClass}
        >
          {collections.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </Field>

      <Field label="Title">
        <input
          name="title"
          defaultValue={item?.title ?? ''}
          required
          autoCapitalize="sentences"
          className={inputClass}
          onChange={(e) => {
            setTitle(e.target.value)
            if (!slugEdited.current) setSlug(slugify(e.target.value))
          }}
        />
      </Field>

      <Field
        label="Slug"
        hint={
          slug
            ? `/work/${slug}`
            : title.trim()
              // Only say this once there is a title that genuinely produced
              // nothing; an empty title has simply not been filled in yet.
              ? 'That title has no Latin letters, so type a slug by hand.'
              : 'Filled in from the title.'
        }
      >
        <input
          name="slug"
          value={slug}
          onChange={(e) => { slugEdited.current = true; setSlug(e.target.value) }}
          inputMode="url"
          autoCapitalize="off"
          autoCorrect="off"
          className={inputClass}
        />
      </Field>

      <Field label="Subtitle" hint="A Hebrew title, “arr. for piano”, “Film group”">
        <input name="subtitle" defaultValue={item?.subtitle ?? ''} className={inputClass} />
      </Field>

      <Field label="Blurb" hint="One or two sentences. Shown on cards and listings.">
        <textarea name="blurb" rows={3} defaultValue={item?.blurb ?? ''} className={inputClass} />
      </Field>

      <Field label="Body" hint="Markdown. Leaving this empty means the item has no page of its own.">
        <textarea name="body" rows={10} defaultValue={item?.body ?? ''} className={inputClass} />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Year" hint="Sorts by this">
          <input
            name="year"
            defaultValue={item?.year ?? ''}
            inputMode="numeric"
            className={inputClass}
          />
        </Field>
        <Field label="Date shown" hint="Overrides the year">
          <input
            name="dateLabel"
            defaultValue={item?.dateLabel ?? ''}
            placeholder="2016–2020"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Tags" hint="Comma separated">
        <input
          name="tags"
          defaultValue={item?.tags.join(', ') ?? ''}
          autoCapitalize="off"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Link">
          <input
            name="url"
            defaultValue={item?.url ?? ''}
            inputMode="url"
            autoCapitalize="off"
            className={inputClass}
          />
        </Field>
        <Field label="Link label">
          <input name="urlLabel" defaultValue={item?.urlLabel ?? ''} className={inputClass} />
        </Field>
      </div>

      {/* Sticky, so the save button is always in reach however long the body
          gets. The whole point of /admin is that it works one-handed. */}
      <div className="sticky bottom-0 -mx-4 mt-6 border-t border-rule bg-bg/95 px-4 py-3 backdrop-blur">
        {state?.error && <p className="mb-2 text-sm text-accent">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="min-h-12 w-full border border-accent text-base text-accent disabled:opacity-50"
        >
          {pending ? 'Saving…' : item ? 'Save' : 'Create'}
        </button>
      </div>
    </form>
  )
}
