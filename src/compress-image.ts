import {
  EncoderState,
  EncoderType,
  EncoderOptions,
  encoderMap,
} from 'squoosh/src/codecs/encoders'
import Processor from 'squoosh/src/codecs/processor'
import {
  identity,
  optiPNG,
  mozJPEG,
  webP,
  browserPNG,
  browserJPEG,
  browserWebP,
  browserGIF,
  browserTIFF,
  browserJP2,
  browserBMP,
  browserPDF,
} from './encoders'
import { Fileish } from './fileish'

async function compressImage(
  image: ImageData,
  encodeData: EncoderState,
  sourceFilename: string,
  processor: Processor
): Promise<Fileish> {
  const compressedData = await (() => {
    switch (encodeData.type) {
      case optiPNG.type:
        return processor.optiPngEncode(image, encodeData.options)
      case mozJPEG.type:
        return processor.mozjpegEncode(image, encodeData.options)
      case webP.type:
        return processor.webpEncode(image, encodeData.options)
      case browserPNG.type:
        return processor.browserPngEncode(image)
      case browserJPEG.type:
        return processor.browserJpegEncode(image, encodeData.options)
      case browserWebP.type:
        return processor.browserWebpEncode(image, encodeData.options)
      case browserGIF.type:
        return processor.browserGifEncode(image)
      case browserTIFF.type:
        return processor.browserTiffEncode(image)
      case browserJP2.type:
        return processor.browserJp2Encode(image)
      case browserBMP.type:
        return processor.browserBmpEncode(image)
      case browserPDF.type:
        return processor.browserPdfEncode(image)
      default:
        throw Error(`Unexpected encoder ${JSON.stringify(encodeData)}`)
    }
  })()

  const encoder = encoderMap[encodeData.type]

  return new Fileish(
    [compressedData],
    sourceFilename.replace(/.[^.]*$/, `.${encoder.extension}`),
    { type: encoder.mimeType }
  )
}

export default compressImage
