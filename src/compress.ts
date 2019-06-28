import { EncoderState, encoderMap } from './codecs-api/encoders'
import Processor from './codecs-api/processor'
import { Fileish } from 'squoosh/src/lib/initial-util'
import * as identity from 'src/codecs-api/identity/encoder-meta'
import * as optiPNG from 'src/codecs-api/optipng/encoder-meta'
import * as mozJPEG from 'src/codecs-api/codecs/mozjpeg/encoder-meta'
import * as webP from 'src/codecs-api/webp/encoder-meta'
import * as browserPNG from 'src/codecs-api/codecs/browser-png/encoder-meta'
import * as browserJPEG from 'src/codecs-api/codecs/browser-jpeg/encoder-meta'
import * as browserWebP from 'src/codecs-api/codecs/browser-webp/encoder-meta'
import * as browserGIF from 'src/codecs-api/codecs/browser-gif/encoder-meta'
import * as browserTIFF from 'src/codecs-api/codecs/browser-tiff/encoder-meta'
import * as browserJP2 from 'src/codecs-api/codecs/browser-jp2/encoder-meta'
import * as browserBMP from 'src/codecs-api/codecs/browser-bmp/encoder-meta'
import * as browserPDF from 'src/codecs-api/codecs/browser-pdf/encoder-meta'

async function compressImageData(
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

export default compressImageData
