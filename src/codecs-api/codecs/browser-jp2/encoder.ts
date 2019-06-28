import { mimeType } from './encoder-meta'
import { canvasEncode } from 'src/util/canvas/canvas-encode'
// import { canvasEncode } from '../../lib/util';
// canvasEncode

export function encode(data: ImageData) {
  return canvasEncode(data, mimeType)
}