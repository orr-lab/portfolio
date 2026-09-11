// Hands the browser a short-lived token so files go straight from the phone to
// Blob storage. Server actions cap their request body at a few megabytes, so
// twenty photos could never be posted through one — and this way the bytes
// never make a detour through the server at all.
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { isAuthed } from '@/lib/session'

const ALLOWED = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/heic',
  'video/mp4', 'video/quicktime', 'video/webm',
  'audio/mpeg', 'audio/mp4', 'audio/wav', 'audio/ogg', 'audio/flac',
  'application/pdf',
]

export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // This endpoint is public, like every route. The session is checked
        // before any token exists, or anyone could fill Orr's blob store.
        if (!(await isAuthed())) throw new Error('Not signed in.')
        return {
          allowedContentTypes: ALLOWED,
          addRandomSuffix: true,
          maximumSizeInBytes: 100 * 1024 * 1024,
        }
      },
      // Nothing to do: the media row is written by a server action once the
      // browser reports the upload finished.
      onUploadCompleted: async () => {},
    })
    return Response.json(result)
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 })
  }
}
