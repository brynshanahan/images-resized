import { EncodeOptions, browserwebpMeta } from './encoder-meta'
import { canvasEncode } from 'src/util/canvas/canvas-encode'
// import { canvasEncode } from '../../lib/util';

export function encode(data: ImageData, { quality }: EncodeOptions) {
  return canvasEncode(data, browserwebpMeta.mimeType, quality)
}
