import type { Metadata } from 'next'
import './globals.css'

// Next reads this object to fill in <title> and the meta tags. No <head> needed.
export const metadata: Metadata = {
  title: 'Orr Knaan',
  description: 'I make things across film, music, code and drawing.',
}

// `children` is a prop — a value passed in from outside. Next passes the page
// being rendered, so this component wraps every route on the site.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
