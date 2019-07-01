import { canvasEncodeTest } from 'src/util/environment/canvas-encode-test'
import EncoderMeta from '../encoder-meta-interface'

export interface EncodeOptions {}

export const browserpdfMeta: EncoderMeta<EncodeOptions> = {
  type: 'browser-pdf',
  label: 'Browser PDF',
  mimeType: 'application/pdf',
  extensions: ['pdf'],
  optDescription: {},
  defaultOptions: {},
  featureTest() {
    return canvasEncodeTest(this.mimeType)
  },
}
