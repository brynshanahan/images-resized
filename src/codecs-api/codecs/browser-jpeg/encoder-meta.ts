import EncoderMeta from '../encoder-meta-interface'

export interface EncodeOptions {
  quality: number
}

export const browserjpegMeta: EncoderMeta<EncodeOptions> = {
  type: 'browser-jpeg',
  label: 'Browser JPEG',
  mimeType: 'image/jpeg',
  extensions: ['jpg'],
  optDescription: {},
  defaultOptions: { quality: 0.75 },
}
