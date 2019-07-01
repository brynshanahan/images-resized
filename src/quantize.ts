import Processor from './processor'

interface QuantizeOptions {
  zx: number
  maxNumColors: number
  dither: number
}

export const defaultQuantizeOptions: QuantizeOptions = {
  zx: 0,
  maxNumColors: 256,
  dither: 1.0
}

async function quantizeImageData(
  imageData: ImageData,
  options: QuantizeOptions,
  processor: Processor
) {
  const config = {
    ...defaultQuantizeOptions,
    ...options
  }
  return processor.imageQuant(imageData, config)
}

export default quantizeImageData
