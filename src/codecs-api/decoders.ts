import Processor from './processor'
import webpDataUrl from 'url-loader!./tiny.webp'
import { nativeDecode, canDecodeImage } from 'src/util/image/decode-image'
import { sniffMimeType } from 'src/util/files/sniff-mime-type'

const nativeWebPSupported = canDecodeImage(webpDataUrl)

export async function decodeImage(
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
