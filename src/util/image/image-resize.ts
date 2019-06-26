import { drawDataToCanvas } from '../canvas/draw-data-to-canvas'

export type NativeResizeMethod = 'pixelated' | 'low' | 'medium' | 'high'

export function nativeResize(
  data: ImageData,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
  dw: number,
  dh: number,
  method: NativeResizeMethod
): ImageData {
  const canvasSource = document.createElement('canvas')
  canvasSource.width = data.width
  canvasSource.height = data.height
  drawDataToCanvas(canvasSource, data)

  const canvasDest = document.createElement('canvas')
  canvasDest.width = dw
  canvasDest.height = dh
  const ctx = canvasDest.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas context')

  if (method === 'pixelated') {
    ctx.imageSmoothingEnabled = false
  } else {
    ctx.imageSmoothingQuality = method
  }

  ctx.drawImage(canvasSource, sx, sy, sw, sh, 0, 0, dw, dh)
  return ctx.getImageData(0, 0, dw, dh)
}
