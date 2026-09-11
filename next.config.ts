import type { NextConfig } from 'next'

const config: NextConfig = {
  images: {
    // Vercel Blob serves uploads from this host; Next refuses to optimise
    // images from hosts it has not been told about.
    remotePatterns: [{ protocol: 'https', hostname: '*.public.blob.vercel-storage.com' }],
  },
}

export default config
