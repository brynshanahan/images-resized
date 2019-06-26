import { Fileish } from './fileish'
import {
  InputProcessorState,
  defaultInputProcessorState,
} from 'squoosh/src/codecs/input-processors'
import {
  PreprocessorState,
  defaultPreprocessorState,
} from 'squoosh/src/codecs/preprocessors'
import {
  BrowserResizeOptions,
  isWorkerOptions as isWorkerResizeOptions,
} from 'squoosh/src/codecs/resize/processor-meta'
import Processor from 'squoosh/src/codecs/processor'

export interface SourceImage {
  file: File | Fileish
  decoded: ImageData
  processed: ImageData
  vectorImage?: HTMLImageElement
  inputProcessorState: InputProcessorState
}

async function preprocessImage(
  source: SourceImage,
  preprocessData: PreprocessorState,
  processor: Processor
): Promise<ImageData> {
  let result = source.processed

  if (preprocessData.resize.enabled) {
    if (preprocessData.resize.method === 'vector' && source.vectorImage) {
      result = processor.vectorResize(source.vectorImage, preprocessData.resize)
    } else if (isWorkerResizeOptions(preprocessData.resize)) {
      result = await processor.workerResize(result, preprocessData.resize)
    } else {
      result = processor.resize(
        result,
        preprocessData.resize as BrowserResizeOptions
      )
    }
  }
  if (preprocessData.quantizer.enabled) {
    result = await processor.imageQuant(result, preprocessData.quantizer)
  }
  return result
}

export default preprocessImage
