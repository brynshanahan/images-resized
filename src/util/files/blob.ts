import { decodeImage } from '../image/decode-image'

function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return new Response(blob).arrayBuffer()
}

function blobToText(blob: Blob): Promise<string> {
  return new Response(blob).text()
}

async function blobToImg(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob)

  try {
    return await decodeImage(url)
  } finally {
    URL.revokeObjectURL(url)
  }
}

export { blobToArrayBuffer, blobToImg, blobToText }
