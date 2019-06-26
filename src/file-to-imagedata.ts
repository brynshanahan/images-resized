import Processor from './codecs-api/processor'
import webpDataUrl from './codecs-api/tiny.webp'
import { nativeDecode, canDecodeImage } from './util/image/decode-image'
import { sniffMimeType } from './util/files/sniff-mime-type'

const nativeWebPSupported = canDecodeImage(webpDataUrl)

export async function fileToImageData(
  blob: Blob,
  processor: Processor
): Promise<ImageData> {
  const mimeType = await sniffMimeType(blob)

  try {
    if (mimeType === 'image/webp' && !(await nativeWebPSupported)) {
      return await processor.webpDecode(blob)
    }

    // Otherwise, just throw it at the browser's decoder.
    return await nativeDecode(blob)
  } catch (err) {
    throw Error("Couldn't decode image")
  }
}
