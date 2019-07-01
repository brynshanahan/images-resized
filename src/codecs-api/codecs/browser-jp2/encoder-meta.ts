import { canvasEncodeTest } from 'src/util/environment/canvas-encode-test'

export interface EncodeOptions {}

export const browserjp2Meta = {
  type: 'browser-jp2',
  label: 'Browser JPEG 2000',
  mimeType: 'image/jp2',
  extension: 'jp2',
  defaultOptions: {},
  featureTest() {
    return canvasEncodeTest(this.mimeType)
  },
}
