import testImage from '../assets/images/image.jpg'
import { decodeImage } from 'squoosh/src/codecs/decoders'
import processSvg from './process-svg'
import { drawableToImageData } from 'squoosh/src/lib/util'
import processInput from './process-input'
import {
  InputProcessorState,
  defaultInputProcessorState,
} from 'squoosh/src/codecs/input-processors'
import { mozJPEG } from './encoders'
import preprocessImage from './preprocess-image'
import Processor from 'squoosh/src/codecs/processor'

async function loadImage(url, name: string) {
  console.log('Loading', url)
  const response = await fetch(url)
  const blob = await response.blob()
  blob.name = 'test.jpg'
  return blob
}

async function getImages() {
  const file = await loadImage(testImage, 'image.jpg')

  const processor = new Processor()

  try {
    let decoded: ImageData
    let vectorImage: HTMLImageElement | undefined

    // Special-case SVG. We need to avoid createImageBitmap because of
    // https://bugs.chromium.org/p/chromium/issues/detail?id=606319.
    // Also, we cache the HTMLImageElement so we can perform vector resizing later.
    if (file.type.startsWith('image/svg+xml')) {
      vectorImage = await processSvg(file)
      decoded = drawableToImageData(vectorImage)
    } else {
      // Either processor is good enough here.
      decoded = await decodeImage(file, processor)
    }

    const preprocessed = await preprocessImage(
      source,
      settings.preprocessorState,
      processor
    )

    const processed = await processInput(
      decoded,
      defaultInputProcessorState,
      processor
    )

    console.log(processed)
  } catch (err) {
    if (err.name === 'AbortError') return
    console.error(err)
  }
}

export default getImages
