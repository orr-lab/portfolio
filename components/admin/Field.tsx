// Shared field chrome. Full width, 16px text (anything smaller makes iOS zoom
// the whole page on focus), and a label big enough to hit with a thumb.
export function Field({
  label, hint, children,
}: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="mt-5 block">
      <span className="block text-sm text-dim">{label}</span>
      {hint && <span className="mt-0.5 block text-xs text-dim opacity-70">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  )
}

export const inputClass =
  'w-full border border-rule bg-transparent px-3 py-3 text-base outline-none focus:border-accent'
