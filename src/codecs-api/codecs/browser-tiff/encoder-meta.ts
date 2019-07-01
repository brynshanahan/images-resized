import { canvasEncodeTest } from 'src/util/environment/canvas-encode-test'
import EncoderMeta from '../encoder-meta-interface'

export interface EncodeOptions {}

export const browsertiffMeta: EncoderMeta<EncodeOptions> = {
  type: 'browser-tiff',
  label: 'Browser TIFF',
  mimeType: 'image/tiff',
  extensions: ['tiff'],
  optDescription: {},
  defaultOptions: {},
  featureTest() {
    return canvasEncodeTest(this.mimeType)
  },
}
