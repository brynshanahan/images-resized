import { EncoderState, encoderMap } from './codecs-api/encoders'
import Processor from './processor'
import { Fileish } from 'squoosh/src/lib/initial-util'
import {
  optipngMeta,
  mozjpegMeta,
  webpMeta,
  browserpngMeta,
  browserjpegMeta,
  browserwebpMeta,
  browsergifMeta,
  browsertiffMeta,
  browserjp2Meta,
  browserbmpMeta,
  browserpdfMeta
} from './codecs-api/codecs/codecs'

async function compressImageData(
  image: ImageData,
  imageType: string,
  options: EncoderState['options'],
  sourceFilename: string,
  processor: Processor
): Promise<Fileish> {
  const imageEncoder = pickEncoderForType(imageType, processor)
  const compressedData = await imageEncoder(image, options)

  /* Just used to get the image metadata */
  const encoder = encoderMap[imageType]

  return new Fileish(
    [compressedData],
    sourceFilename.replace(/.[^.]*$/, `.${encoder.extension}`),
    { type: encoder.mimeType }
  )
}

function pickEncoderForType(type: string, processor: Processor) {
  switch (type) {
    case optipngMeta.type:
      return processor.optiPngEncode
    case mozjpegMeta.type:
      return processor.mozjpegEncode
    case webpMeta.type:
      return processor.webpEncode
    case browserpngMeta.type:
      return processor.browserPngEncode
    case browserjpegMeta.type:
      return processor.browserJpegEncode
    case browserwebpMeta.type:
      return processor.browserWebpEncode
    case browsergifMeta.type:
      return processor.browserGifEncode
    case browsertiffMeta.type:
      return processor.browserTiffEncode
    case browserjp2Meta.type:
      return processor.browserJp2Encode
    case browserbmpMeta.type:
      return processor.browserBmpEncode
    case browserpdfMeta.type:
      return processor.browserPdfEncode
    default:
      throw Error(`Unexpected encoder ${JSON.stringify(type)}`)
  }
}

export default compressImageData
