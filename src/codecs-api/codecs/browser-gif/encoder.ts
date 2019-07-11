import { canvasEncode } from 'src/util/canvas/canvas-encode'
import { browsergifMeta } from './encoder-meta'
// import { canvasEncode } from '../../lib/util';

export function encode(data: ImageData) {
  return canvasEncode(data, browsergifMeta.mimeType)
}
