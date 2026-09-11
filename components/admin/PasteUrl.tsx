import { addPastedUrl } from '@/app/admin/actions'
import { inputClass } from './Field'

/**
 * Pasting a URL. A YouTube or Vimeo link becomes a player; anything else
 * becomes a labelled link, and picks up that service's mark automatically if
 * the site recognises the host.
 */
export default function PasteUrl({ itemId }: { itemId: string }) {
  return (
    <form action={addPastedUrl} className="mt-8 border-t border-rule pt-6">
      <input type="hidden" name="itemId" value={itemId} />
      <h2 className="eyebrow">Paste a link</h2>
      <p className="mt-1 text-xs text-dim opacity-70">
        YouTube and Vimeo become players. Anything else becomes a link.
      </p>
      <input
        name="url"
        placeholder="https://…"
        inputMode="url"
        autoCapitalize="off"
        className={`${inputClass} mt-3`}
      />
      <div className="mt-2 flex gap-2">
        <input name="caption" placeholder="Label (optional)" className={inputClass} />
        <button className="min-h-12 shrink-0 border border-accent px-4 text-base text-accent">
          Add
        </button>
      </div>
    </form>
  )
}
