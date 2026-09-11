// Shared connection helper for the one-off scripts in db/.
// The app itself uses lib/db.ts (the HTTP driver, which suits serverless);
// migrations need a real session, so they open a WebSocket connection instead.
import { neonConfig, Client } from '@neondatabase/serverless'

// Node 22+ ships a standard WebSocket global, so nothing extra to install.
neonConfig.webSocketConstructor = WebSocket as unknown as typeof neonConfig.webSocketConstructor

export async function connect() {
  const url = process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL_UNPOOLED
  if (!url) {
    throw new Error('No database URL. Run: vercel env pull .env.local')
  }
  const client = new Client(url)
  await client.connect()
  return client
}
