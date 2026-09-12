import type { Metadata } from 'next'
import { Archivo, Instrument_Serif } from 'next/font/google'
import './globals.css'
import AudioProvider from '@/components/AudioProvider'
import { site } from '@/site.config'
import NowPlaying from '@/components/NowPlaying'

// next/font downloads these at build time and serves them from our own domain,
// so there is no request to Google and no flash of the wrong typeface.
// Deliberately not Inter: it is the house font of every developer portfolio,
// and the brief's test is that this should not look like any of them.
const text = Archivo({
  subsets: ['latin'],
  variable: '--font-text',
  display: 'swap',
})

// An editorial serif for names and titles. Safe House is black and white and
// its title card is set in a serif; this follows that rather than fighting it.
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: site.name,
  description: site.tagline,
  metadataBase: new URL(site.url),
  openGraph: {
    title: site.name,
    description: site.tagline,
    url: site.url,
    siteName: site.name,
    type: 'website',
  },
}

// `children` is a prop — a value passed in from outside. Next passes the page
// being rendered, so this component wraps every route on the site.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior tells Next the smooth scrolling in globals.css is
    // deliberate, so it does not warn about it on every route change.
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${text.variable} ${display.variable}`}
      // The script below sets an attribute on this element before React sees
      // it, which is exactly the mismatch this suppresses.
      suppressHydrationWarning
    >
      <body>
        {/* Runs before anything paints, so a reader who chose light does not
            get a flash of the dark theme first. Inline and tiny on purpose:
            a separate file would arrive too late to prevent it. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
        {/* One <audio> for the whole site. Client-side navigation never
            unmounts the root layout, which is exactly why the music keeps
            playing when you open another page. */}
        <AudioProvider>
          <NowPlaying />
          {children}
        </AudioProvider>
      </body>
    </html>
  )
}
