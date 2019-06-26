/** Replace the contents of a canvas with the given data */
export function drawDataToCanvas(canvas: HTMLCanvasElement, data: ImageData) {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw Error('Canvas not initialized')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.putImageData(data, 0, 0)
}
