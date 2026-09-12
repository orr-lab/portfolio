import { iconForUrl, serviceNameFor } from './Icons'
import { site } from '@/site.config'

export default function Hero() {
  // 44px boxes around 21px marks: the icon is the thing you see, the box is
  // the thing a thumb actually hits.
  const hit = 'inline-flex h-11 w-11 items-center justify-center text-accent transition-opacity hover:opacity-70'

  return (
    <header className="pt-20 pb-14 sm:pt-28 sm:pb-20">
      <h1 className="display text-4xl sm:text-5xl">{site.name}</h1>
      <p className="mt-5 max-w-md text-lg text-dim">{site.tagline}</p>

      {/* One list in site.config drives this. A service with a mark shows it;
          anything else falls back to its name, which is why GitHub reads as a
          word rather than a badly redrawn octocat. */}
      <nav className="mt-4 -ml-3 flex flex-wrap items-center gap-y-1">
        {site.links.map((href) => {
          const Icon = iconForUrl(href)
          const name = serviceNameFor(href)
          return Icon ? (
            <a
              key={href}
              href={href}
              aria-label={`${site.name} on ${name}`}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer"
              className={hit}
            >
              <Icon />
            </a>
          ) : (
            <a
              key={href}
              href={href}
              target={href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer"
              className="ml-2 inline-flex h-11 items-center text-sm text-accent underline-offset-4 hover:underline"
            >
              {name.toLowerCase()} ↗
            </a>
          )
        })}
      </nav>
    </header>
  )
}
