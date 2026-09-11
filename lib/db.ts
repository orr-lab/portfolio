// The app's database handle. This is the HTTP driver: each query is one
// stateless request, which is what suits serverless rendering. The scripts in
// db/ use a WebSocket connection instead, because migrations need a session.
import { neon } from '@neondatabase/serverless'

const url = process.env.POSTGRES_URL
if (!url) throw new Error('POSTGRES_URL is not set. Run: vercel env pull .env.local')

// Used as a tagged template — sql`select * from items where id = ${id}` — which
// parameterises the value rather than pasting it into the string.
export const sql = neon(url)
