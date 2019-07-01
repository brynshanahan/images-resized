import EncoderMeta from '../encoder-meta-interface'

export enum MozJpegColorSpace {
  GRAYSCALE = 1,
  RGB,
  YCbCr,
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
  },
  defaultOptions: {
    quality: 60,
    baseline: false,
    arithmetic: false,
    progressive: true,
    optimize_coding: true,
    smoothing: 0,
    color_space: MozJpegColorSpace.YCbCr,
    quant_table: 3,
    trellis_multipass: false,
    trellis_opt_zero: false,
    trellis_opt_table: false,
    trellis_loops: 1,
    auto_subsample: true,
    chroma_subsample: 2,
    separate_chroma_quality: false,
    chroma_quality: 75,
  },
}
