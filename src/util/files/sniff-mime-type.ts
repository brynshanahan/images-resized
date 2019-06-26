import { blobToArrayBuffer } from './blob'

const magicNumberToMimeType = new Map<RegExp, string>([
  [/^%PDF-/, 'application/pdf'],
  [/^GIF87a/, 'image/gif'],
  [/^GIF89a/, 'image/gif'],
  [/^\x89PNG\x0D\x0A\x1A\x0A/, 'image/png'],
  [/^\xFF\xD8\xFF/, 'image/jpeg'],
  [/^BM/, 'image/bmp'],
  [/^I I/, 'image/tiff'],
  [/^II*/, 'image/tiff'],
  [/^MM\x00*/, 'image/tiff'],
  [/^RIFF....WEBPVP8[LX ]/, 'image/webp'],
])

export async function sniffMimeType(blob: Blob): Promise<string> {
  const firstChunk = await blobToArrayBuffer(blob.slice(0, 16))
  const firstChunkString = Array.from(new Uint8Array(firstChunk))
    .map(v => String.fromCodePoint(v))
    .join('')
  for (const [detector, mimeType] of magicNumberToMimeType) {
    if (detector.test(firstChunkString)) {
      return mimeType
    }
  }
  return ''
}
