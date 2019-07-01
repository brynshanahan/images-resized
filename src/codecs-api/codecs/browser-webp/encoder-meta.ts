import EncoderMeta from '../encoder-meta-interface'
import { canvasEncodeTest } from 'src/util/environment/canvas-encode-test'

export interface EncodeOptions {
  quality: number
}

export const browserwebpMeta: EncoderMeta<EncodeOptions> = {
  type: 'browser-webp',
  label: 'Browser WebP',
  mimeType: 'image/webp',
  extensions: ['webp'],
  optDescription: {},
  defaultOptions: { quality: 0.75 },
  featureTest() {
    return canvasEncodeTest(this.mimeType)
  },
}
