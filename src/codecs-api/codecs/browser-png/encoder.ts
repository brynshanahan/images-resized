import { browserpngMeta } from './encoder-meta'
import { canvasEncode } from 'src/util/canvas/canvas-encode'

export function encode(data: ImageData) {
  return canvasEncode(data, browserpngMeta.mimeType)
}
