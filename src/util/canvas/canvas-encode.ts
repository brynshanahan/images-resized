/**
 * Encode some image data in a given format using the browser's encoders
 *
 * @param {ImageData} data
 * @param {string} type A mime type, eg image/jpeg.
 * @param {number} [quality] Between 0-1.
 */
export async function canvasEncode(
  data: ImageData,
  type: string,
  quality?: number
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = data.width
  canvas.height = data.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw Error('Canvas not initialized')
  ctx.putImageData(data, 0, 0)

  let blob: Blob | null

  if ('toBlob' in canvas) {
    blob = await new Promise<Blob | null>(r => canvas.toBlob(r, type, quality))
  } else {
    // Welcome to Edge.
    // TypeScript thinks `canvas` is 'never', so it needs casting.
    const dataUrl = (canvas as HTMLCanvasElement).toDataURL(type, quality)
    const result = /data:([^;]+);base64,(.*)$/.exec(dataUrl)

    if (!result) throw Error('Data URL reading failed')

    const outputType = result[1]
    const binaryStr = atob(result[2])
    const data = new Uint8Array(binaryStr.length)

    for (let i = 0; i < data.length; i += 1) {
      data[i] = binaryStr.charCodeAt(i)
    }

    blob = new Blob([data], { type: outputType })
  }

  if (!blob) throw Error('Encoding failed')
  return blob
}
