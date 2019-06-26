import Processor from './codecs-api/processor'

const ROTATE_NONE = 0
const ROTATE_RIGHT = 90
const ROTATE_DOWN = 180
const ROTATE_LEFT = 270

export interface RotateOptions {
  rotation?:
    | typeof ROTATE_NONE
    | typeof ROTATE_RIGHT
    | typeof ROTATE_DOWN
    | typeof ROTATE_LEFT
}

async function rotateImageData(
  imageData: ImageData,
  options: RotateOptions,
  processor: Processor
) {
  const { rotation = 0 } = options

  if (rotation !== ROTATE_NONE) {
    return await processor.rotate(imageData, rotation)
  } else {
    return imageData
  }
}

export default rotateImageData
