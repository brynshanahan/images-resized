// import { nativeResize, NativeResizeMethod, drawableToImageData } from '../../lib/util';
import { BrowserResizeOptions, VectorResizeOptions } from './processor-meta'
import { getContainOffsets } from './util'
import { nativeResize, NativeResizeMethod } from 'src/util/image/image-resize'
import { drawableToImageData } from 'src/util/image/drawable-to-image-data'

export function browserResize(
  data: ImageData,
  opts: BrowserResizeOptions
): ImageData {
  let sx = 0
  let sy = 0
  let sw = data.width
  let sh = data.height

  if (opts.fit === 'contain') {
    ;({ sx, sy, sw, sh } = getContainOffsets(sw, sh, opts.width, opts.height))
  }

  return nativeResize(
    data,
    sx,
    sy,
    sw,
    sh,
    opts.width,
    opts.height,
    opts.method.slice('browser-'.length) as NativeResizeMethod
  )
}

export function vectorResize(
  data: HTMLImageElement,
  opts: VectorResizeOptions
): ImageData {
  let sx = 0
  let sy = 0
  let sw = data.width
  let sh = data.height

  if (opts.fit === 'contain') {
    ;({ sx, sy, sw, sh } = getContainOffsets(sw, sh, opts.width, opts.height))
  }

  return drawableToImageData(data, {
    sx,
    sy,
    sw,
    sh,
    width: opts.width,
    height: opts.height,
  })
}
