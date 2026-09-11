import { InstagramIcon, MailIcon, YouTubeIcon } from './Icons'

export const CONTACT = {
  youtube: 'https://www.youtube.com/@orrknaan',
  instagram: 'https://www.instagram.com/orrknaan/',
  github: 'https://github.com/orr-lab',
  email: 'orrknaan@gmail.com',
}

export default function Hero() {
  // 44px boxes around 21px marks: the icon is the thing you see, the box is
  // the thing a thumb actually hits.
  const hit = 'inline-flex h-11 w-11 items-center justify-center text-accent transition-opacity hover:opacity-70'

  return (
    <header className="pt-20 pb-16 sm:pt-28 sm:pb-24">
      <h1 className="text-4xl tracking-tight sm:text-5xl">Orr Knaan</h1>
      <p className="mt-4 max-w-lg text-lg text-dim">
        I make things across film, music, code and drawing.
      </p>
      {/* Negative margin pulls the first icon's padding back so the row lines
          up with the text above it rather than looking indented. */}
      <nav className="mt-4 -ml-3 flex flex-wrap items-center gap-y-1">
        <a href={CONTACT.youtube} target="_blank" rel="noreferrer"
           aria-label="Orr Knaan on YouTube" className={hit}>
          <YouTubeIcon />
        </a>
        <a href={CONTACT.instagram} target="_blank" rel="noreferrer"
           aria-label="Orr Knaan on Instagram" className={hit}>
          <InstagramIcon />
        </a>
        <a href={`mailto:${CONTACT.email}`}
           aria-label={`Email ${CONTACT.email}`} className={hit}>
          <MailIcon />
        </a>
        {/* Text, because the octocat cannot be redrawn faithfully by hand. */}
        <a href={CONTACT.github} target="_blank" rel="noreferrer"
           className="ml-2 inline-flex h-11 items-center text-sm text-accent underline-offset-4 hover:underline">
          github ↗
        </a>
      </nav>
    </header>
  )
}
