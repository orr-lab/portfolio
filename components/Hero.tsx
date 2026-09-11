export const CONTACT = {
  github: 'https://github.com/orr-lab',
  email: 'orrknaan@gmail.com',
}

export default function Hero() {
  return (
    <header className="pt-20 pb-16 sm:pt-28 sm:pb-24">
      <h1 className="text-4xl tracking-tight sm:text-5xl">Orr Knaan</h1>
      <p className="mt-4 max-w-lg text-lg text-dim">
        I make things across film, music, code and drawing.
      </p>
      <nav className="mt-6 flex gap-6 text-sm">
        <a href={CONTACT.github} target="_blank" rel="noreferrer"
           className="text-accent underline-offset-4 hover:underline">github ↗</a>
        <a href={`mailto:${CONTACT.email}`}
           className="text-accent underline-offset-4 hover:underline">{CONTACT.email} ↗</a>
      </nav>
    </header>
  )
}
