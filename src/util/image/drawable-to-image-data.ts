interface DrawableToImageDataOptions {
  width?: number
  height?: number
  sx?: number
  sy?: number
  sw?: number
  sh?: number
}

function drawableToImageData(
  drawable: ImageBitmap | HTMLImageElement,
  opts: DrawableToImageDataOptions = {}
): ImageData {
  const {
    width = drawable.width,
    height = drawable.height,
    sx = 0,
    sy = 0,
    sw = drawable.width,
    sh = drawable.height,
  } = opts

  // Make canvas same size as image
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  // Draw image onto canvas
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not create canvas context')
  ctx.drawImage(drawable, sx, sy, sw, sh, 0, 0, width, height)
  return ctx.getImageData(0, 0, width, height)
}

export { drawableToImageData }
