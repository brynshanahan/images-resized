import { drawableToImageData } from './drawable-to-image-data'
import { blobToImg } from '../files/blob'

/**
 * Attempts to load the given URL as an image.
 */
function canDecodeImage(url: string): Promise<boolean> {
  return decodeImage(url).then(() => true, () => false)
}

async function decodeImage(url: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.decoding = 'async'
  img.src = url
  const loaded = new Promise((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(Error('Image loading error'))
  })

  if (img.decode) {
    // Nice off-thread way supported in Safari/Chrome.
    // Safari throws on decode if the source is SVG.
    // https://bugs.webkit.org/show_bug.cgi?id=188347
    await img.decode().catch(() => null)
  }

  // Always await loaded, as we may have bailed due to the Safari bug above.
  await loaded
  return img
}

export async function nativeDecode(blob: Blob): Promise<ImageData> {
  // Prefer createImageBitmap as it's the off-thread option for Firefox.
  const drawable =
    'createImageBitmap' in self
      ? await createImageBitmap(blob)
      : await blobToImg(blob)

  return drawableToImageData(drawable)
}

export { canDecodeImage, decodeImage }
