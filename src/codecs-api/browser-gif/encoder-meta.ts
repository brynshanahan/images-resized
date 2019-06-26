import { canvasEncodeTest } from 'src/util/environment/canvas-encode-test'

// import { canvasEncodeTest } from '../generic/util';
// canvasEncodeTest

export interface EncodeOptions {}
export interface EncoderState {
  type: typeof type
  options: EncodeOptions
}

export const type = 'browser-gif'
export const label = 'Browser GIF'
export const mimeType = 'image/gif'
export const extension = 'gif'
export const defaultOptions: EncodeOptions = {}
export const featureTest = () => canvasEncodeTest(mimeType)
