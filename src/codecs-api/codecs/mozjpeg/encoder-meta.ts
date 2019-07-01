import EncoderMeta from '../encoder-meta-interface'

export enum MozJpegColorSpace {
  GRAYSCALE = 1,
  RGB,
  YCbCr
}

export interface EncodeOptions {
  quality: number
  baseline: boolean
  arithmetic: boolean
  progressive: boolean
  optimize_coding: boolean
  smoothing: number
  color_space: MozJpegColorSpace
  quant_table: number
  trellis_multipass: boolean
  trellis_opt_zero: boolean
  trellis_opt_table: boolean
  trellis_loops: number
  auto_subsample: boolean
  chroma_subsample: number
  separate_chroma_quality: boolean
  chroma_quality: number
}

export const mozjpegMeta: EncoderMeta<EncodeOptions> = {
  type: 'mozjpeg',
  label: 'MozJPEG',
  mimeType: 'image/jpeg',
  extensions: ['jpg'],
  optDescription: {
    quality:
      'Overall quality of an image, lower quality results in a smaller file size',
    arithmetic: 'A new way of encoding jpeg that is not very widely supported.'
  },
  defaultOptions: {
    quality: 75,
    baseline: false,
    arithmetic: false,
    progressive: true,
    optimize_coding: true,
    smoothing: 1,
    color_space: MozJpegColorSpace.YCbCr,
    quant_table: 3,
    trellis_multipass: true,
    trellis_opt_zero: true,
    trellis_opt_table: true,
    trellis_loops: 1,
    auto_subsample: true,
    chroma_subsample: 2,
    separate_chroma_quality: true,
    chroma_quality: 75
  }
}
