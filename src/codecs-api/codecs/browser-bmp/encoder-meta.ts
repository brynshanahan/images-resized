import { canvasEncodeTest } from 'src/util/environment/canvas-encode-test'
import EncoderMeta from '../encoder-meta-interface'

// import { canvasEncodeTest } from '../generic/util';

export interface EncodeOptions {}

export const browserbmpMeta: EncoderMeta<EncodeOptions> = {
  type: 'browser-bmp',
  label: 'Browser BMP',
  mimeType: 'image/bmp',
  extensions: ['bmp'],
  optDescription: {},
  defaultOptions: {},
  featureTest() {
    return canvasEncodeTest(this.mimeType)
  },
}
