import EncoderMeta from '../encoder-meta-interface'

export interface EncodeOptions {}

export const browserpngMeta: EncoderMeta<EncodeOptions> = {
  type: 'browser-png',
  label: 'Browser PNG',
  mimeType: 'image/png',
  extensions: ['png'],
  optDescription: {},
  defaultOptions: {},
}
