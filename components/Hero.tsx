export const CONTACT = {
  youtube: 'https://www.youtube.com/@orrknaan',
  instagram: 'https://www.instagram.com/orrknaan/',
  github: 'https://github.com/orr-lab',
  email: 'orrknaan@gmail.com',
}

const ELSEWHERE = [
  ['youtube', CONTACT.youtube],
  ['instagram', CONTACT.instagram],
  ['github', CONTACT.github],
] as const

export default function Hero() {
  return (
    <header className="pt-20 pb-16 sm:pt-28 sm:pb-24">
      <h1 className="text-4xl tracking-tight sm:text-5xl">Orr Knaan</h1>
      <p className="mt-4 max-w-lg text-lg text-dim">
        I make things across film, music, code and drawing.
      </p>
      {/* Wraps rather than scrolls: four short links fit two lines on a phone
          without the row becoming something to swipe. */}
      <nav className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        {ELSEWHERE.map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noreferrer"
             className="text-accent underline-offset-4 hover:underline">{label} ↗</a>
        ))}
        <a href={`mailto:${CONTACT.email}`}
           className="text-accent underline-offset-4 hover:underline">{CONTACT.email} ↗</a>
      </nav>
    </header>
  )
}
