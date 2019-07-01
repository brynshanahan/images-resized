import { canvasEncodeTest } from 'src/util/environment/canvas-encode-test'
import EncoderMeta from '../encoder-meta-interface'

// import { canvasEncodeTest } from '../generic/util';
// canvasEncodeTest

export interface EncodeOptions {}

export const browsergifMeta: EncoderMeta<EncodeOptions> = {
  type: 'browser-gif',
  label: 'Browser GIF',
  mimeType: 'image/gif',
  extensions: ['gif'],
  optDescription: {},
  defaultOptions: {},
  featureTest() {
    return canvasEncodeTest(this.mimeType)
  },
}
