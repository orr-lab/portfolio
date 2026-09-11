'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upload } from '@vercel/blob/client'
import {
  addUploadedMedia, deleteMedia, moveMedia, setMediaCaption,
} from '@/app/admin/actions'
import type { Media } from '@/lib/types'
import { inputClass } from './Field'

type Job = { name: string; percent: number; failed?: string }

export default function MediaManager({
  itemId, media, galleryDefault,
}: {
  itemId: string
  media: Media[]
  /** Gallery collections want new files first; everything else appends. */
  galleryDefault: boolean
}) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [atTop, setAtTop] = useState(galleryDefault)
  // useTransition keeps the UI responsive while a server action runs.
  const [, startTransition] = useTransition()

  /** Reads an image's true size in the browser, so the gallery can lay it out
      at its real proportions instead of cropping it to a box. */
  async function measure(file: File): Promise<{ width: number; height: number } | null> {
    if (!file.type.startsWith('image/')) return null
    const url = URL.createObjectURL(file)
    try {
      const img = new Image()
      img.src = url
      await img.decode()
      return { width: img.naturalWidth, height: img.naturalHeight }
    } catch {
      return null
    } finally {
      URL.revokeObjectURL(url)
    }
  }

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return
    setJobs(files.map((f) => ({ name: f.name, percent: 0 })))

    // One at a time: twenty parallel uploads on cellular starve each other and
    // the progress numbers stop meaning anything.
    for (const [i, file] of files.entries()) {
      try {
        const size = await measure(file)
        const result = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/blob/upload',
          onUploadProgress: ({ percentage }) => {
            setJobs((js) => js.map((j, n) => (n === i ? { ...j, percent: percentage } : j)))
          },
        })
        await addUploadedMedia(
          itemId, result.url, file.type || 'application/octet-stream', atTop,
          size?.width, size?.height,
        )
        setJobs((js) => js.map((j, n) => (n === i ? { ...j, percent: 100 } : j)))
      } catch (err) {
        setJobs((js) => js.map((j, n) => (n === i ? { ...j, failed: (err as Error).message } : j)))
      }
    }

    if (fileInput.current) fileInput.current.value = ''
    // Pull the new rows down from the server without a full page load.
    startTransition(() => router.refresh())
    setTimeout(() => setJobs([]), 2500)
  }

  return (
    <section className="mt-12 border-t border-rule pt-6">
      <h2 className="text-sm tracking-widest uppercase text-dim">Media</h2>
      <p className="mt-1 text-xs text-dim opacity-70">
        The first one is the cover.
      </p>

      <label className="mt-4 flex min-h-14 cursor-pointer items-center justify-center border border-dashed border-rule px-4 text-base text-accent">
        <input
          ref={fileInput}
          type="file"
          multiple
          // Lets the phone offer the camera roll directly.
          accept="image/*,video/*,audio/*,application/pdf"
          onChange={onPick}
          className="hidden"
        />
        Add photos, audio or files
      </label>

      <label className="mt-3 flex items-center gap-2 text-sm text-dim">
        <input
          type="checkbox"
          checked={atTop}
          onChange={(e) => setAtTop(e.target.checked)}
          className="h-5 w-5"
        />
        Put new files first
      </label>

      {jobs.length > 0 && (
        <ul className="mt-4">
          {jobs.map((j) => (
            <li key={j.name} className="mt-2 text-xs">
              <div className="flex justify-between gap-3 text-dim">
                <span className="truncate">{j.name}</span>
                <span>{j.failed ? 'failed' : `${Math.round(j.percent)}%`}</span>
              </div>
              <div className="mt-1 h-0.5 w-full bg-rule">
                <div
                  className={`h-0.5 ${j.failed ? 'bg-dim' : 'bg-accent'}`}
                  style={{ width: `${j.failed ? 100 : j.percent}%` }}
                />
              </div>
              {j.failed && <p className="mt-1 text-accent">{j.failed}</p>}
            </li>
          ))}
        </ul>
      )}

      {media.length === 0 ? (
        <p className="mt-5 text-sm text-dim">Nothing yet.</p>
      ) : (
        <ul className="mt-5">
          {media.map((m, i) => (
            <li key={m.id} className="border-b border-rule py-3">
              <div className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-xs tracking-wide text-dim uppercase">
                  {m.kind}
                </span>
                {m.kind === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="" className="h-12 w-12 shrink-0 object-cover" />
                ) : (
                  <a href={m.url} target="_blank" rel="noreferrer"
                     className="min-w-0 flex-1 truncate text-xs text-dim underline">
                    {m.url.split('/').pop()}
                  </a>
                )}
                <span className="ml-auto flex shrink-0">
                  <form action={moveMedia}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="dir" value="up" />
                    <button className="min-h-11 min-w-10 text-dim disabled:opacity-25"
                            disabled={i === 0} title="Move up">↑</button>
                  </form>
                  <form action={moveMedia}>
                    <input type="hidden" name="id" value={m.id} />
                    <input type="hidden" name="dir" value="down" />
                    <button className="min-h-11 min-w-10 text-dim disabled:opacity-25"
                            disabled={i === media.length - 1} title="Move down">↓</button>
                  </form>
                  <form action={deleteMedia}>
                    <input type="hidden" name="id" value={m.id} />
                    <button className="min-h-11 min-w-10 text-dim hover:text-accent"
                            title="Delete">✕</button>
                  </form>
                </span>
              </div>
              {/* Captions save on their own, so editing one never risks the
                  rest of the form. */}
              <form action={setMediaCaption} className="mt-2 flex gap-2">
                <input type="hidden" name="id" value={m.id} />
                <input
                  name="caption"
                  defaultValue={m.caption ?? ''}
                  placeholder="Caption"
                  className={`${inputClass} py-2 text-sm`}
                />
                <button className="min-h-11 shrink-0 px-3 text-sm text-dim hover:text-accent">
                  Save
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
