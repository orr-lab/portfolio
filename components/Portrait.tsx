import Image from 'next/image'
// Importing the file rather than naming its path gives Next the real pixel
// dimensions at build time, so it reserves the right space and can generate
// the tiny blurred placeholder used while the full image loads.
import photo from '@/public/orr-knaan.jpg'

/**
 * Full-bleed, deliberately at the foot of the hub rather than above the
 * featured film: the film is the reason the site exists and should not have to
 * share the top of the page.
 *
 * The source is 4:3. On a phone it stays close to that; on a wide screen it
 * crops to 2:1, which keeps both the peaks and the figure inside the frame
 * while stopping the image from swallowing the whole viewport.
 */
export default function Portrait() {
  return (
    <figure className="relative mt-8 w-full overflow-hidden aspect-[4/3] sm:aspect-[2/1]">
      <Image
        src={photo}
        alt="Orr Knaan walking a mountain path, with a wooded valley and snow-covered peaks behind."
        fill
        sizes="100vw"
        placeholder="blur"
        className="object-cover"
      />
    </figure>
  )
}
