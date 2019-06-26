import {
  InputProcessorState,
  defaultInputProcessorState,
} from 'squoosh/src/codecs/input-processors'
import Processor from 'squoosh/src/codecs/processor'

export default async function processInput(
  data: ImageData,
  inputProcessData: InputProcessorState,
  processor: Processor
) {
  let processedData = data

  if (inputProcessData.rotate.rotate !== 0) {
    processedData = await processor.rotate(
      processedData,
      inputProcessData.rotate
    )
  }

  return processedData
}
