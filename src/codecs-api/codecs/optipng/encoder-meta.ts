import EncoderMeta from '../encoder-meta-interface'

export interface EncodeOptions {
  level: number
}

export const optipngMeta: EncoderMeta<EncodeOptions> = {
  type: 'png',
  label: 'OptiPNG',
  mimeType: 'image/png',
  extensions: ['png'],
  optDescription: {},
  defaultOptions: {
    level: 2,
  },
}
