import { canvasEncode } from 'src/util/canvas/canvas-encode'
import { browserjp2Meta } from './encoder-meta'

export function encode(data: ImageData) {
  return canvasEncode(data, browserjp2Meta.mimeType)
}
