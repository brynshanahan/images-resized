import { Fileish } from 'squoosh/src/lib/initial-util'
import imageUrl from '../assets/images/image.jpg'
import './styles/screen.scss'
import { sniffMimeType } from './util/files/sniff-mime-type'
import Processor from './codecs-api/processor'
import svgBlobToImg, { svgImgToImageData } from './svg-to-image'
import { drawableToImageData } from './util/image/drawable-to-image-data'
import { decodeImage } from './codecs-api/decoders'
import { rotate } from './codecs-api/rotate/processor'
import { RotateOptions } from './codecs-api/rotate/processor-meta'
import { resize } from './codecs-api/resize/processor'
import { defaultResizeOptions } from './codecs-api/resize/processor-meta'
import { WorkerResizeOptions } from './resize'
import quantizeImageData, { defaultQuantizeOptions } from './quantize'
import compressImageData from './compress'
import { EncoderType, encoderMap, EncoderOptions } from './codecs-api/encoders'
import Subject from './util/reactive/subject'
import maintainAspectRatio from './util/image/maintain-aspect-ratio'

async function getImage(src: string) {
  const response = await fetch(src)
  const blob = await response.blob()
  return new Fileish([blob], 'image.jpg', { type: 'image/jpeg' })
}

interface ImageInfo {
  naturalWidth: number
  naturalHeight: number
  src: string
  fileSize: number
  type: string
  name: string
}

interface ImageSize {
  name: string
  size: {
    width: number
    height: number
    fit: 'contain' | 'stretch'
  }
}

const defaultSizes: { [k: string]: ImageSize } = {
  large: {
    name: 'large',
    size: {
      width: 1920,
      height: 1080,
      fit: 'contain',
    },
  },
  medium: {
    name: 'medium',
    size: {
      width: 720,
      height: 480,
      fit: 'contain',
    },
  },
  small: {
    name: 'small',
    size: {
      width: 480,
      height: 360,
      fit: 'contain',
    },
  },
  tiny: {
    name: 'tiny',
    size: {
      width: 64,
      height: 64,
      fit: 'contain',
    },
  },
}

class ProgressorEvent {
  progress: number
  message: string
  percentage: number
  total: number
  step: number

  constructor(step: number, total: number, message: string) {
    const progress = step / total || 0
    this.step = step
    this.progress = progress
    this.message = message
    this.total = total
    this.percentage = Math.round(progress * 1000) / 10
  }
}

type OnProgressHandler = (progress: ProgressorEvent) => any

function combineProgressors(
  progressCount: number,
  onProgress: OnProgressHandler
) {
  /* A list of ProgressorEvents */
  const initialEvent = new ProgressorEvent(0, 1, 'initialEvent')
  const progress = Array(progressCount).fill(initialEvent)

  /* The most recently recieved progress event */
  let lastProgress = progress[progress.length - 1]

  /* Counts the current progress and sends it to callback */
  const emitProgress = () => {
    const step = progress.reduce((acc, event, i) => {
      if (i === 0) {
        return event.progress
      } else {
        return acc + event.progress / (i * 10)
      }
    }, 0)
    const event = new ProgressorEvent(
      step * progress[0].total,
      progress[0].total,
      lastProgress.message
    )
    onProgress && onProgress(event)
  }

  /* Returns an array of onProgress callbacks to be passed to progressables */
  const progressors = progress.map((_, i) => {
    return function onProgress(event: ProgressorEvent) {
      progress[i] = event
      progress.fill(initialEvent, i + 1)
      lastProgress = event
      emitProgress()
    }
  })

  return progressors
}

function progressable(totalSteps: number, handler: OnProgressHandler) {
  let step = 0
  let prevMessage = ''

  return (message: string | false = false, ignore = false) => {
    if (!ignore) step += 1
    if (message) prevMessage = message

    if (step > totalSteps) {
      throw new Error(
        `Step was larger than total steps, this is a no op, increase progressable's totalSteps`
      )
    }
    handler && handler(new ProgressorEvent(step, totalSteps, prevMessage))
  }
}

let processorQueue = []
let processor: false | Processor = false

const getProcessor = (): Processor => {
  if (!processor) {
    processor = new Processor()
  }
  return processor
}

interface FileContainer {
  blob: File | Fileish
  url: string
  img: HTMLImageElement
  width: number
  height: number
}

interface ImageObjectOptions {
  rotation: RotateOptions['rotate']
}

const defaultImageObjectOptions: ImageObjectOptions = {
  rotation: 0,
}

class ImageObject extends Subject {
  file: FileContainer
  files: {
    [k: string]: FileContainer
  }
  data: {
    rotationFromOriginal: RotateOptions['rotate']
    sizes: {
      [k: string]: ImageSize
    }
    original: ImageInfo
    pkg: {
      [k: string]: ImageInfo
    }
  }
  imageData?: ImageData
  queue: []
  imgIsLoading: boolean
  imgHasLoaded: boolean
  isVector: boolean
  mimeType?: Promise<string> | string

  constructor(file: Fileish | File, name: string = 'unknown', optionsArg = {}) {
    super()

    const options: ImageObjectOptions = {
      ...defaultImageObjectOptions,
      ...optionsArg,
    }

    this.file = {
      blob: file,
      url: URL.createObjectURL(file),
      img: new Image(),
      width: 0,
      height: 0,
    }

    this.files = {
      original: this.file,
    }

    /* Data will be serialized to the db */
    this.data = {
      /* Declare what sizes you want to exist */
      sizes: defaultSizes,
      rotationFromOriginal: options.rotation,
      original: {
        naturalWidth: this.file.img.naturalWidth,
        naturalHeight: this.file.img.naturalHeight,
        src: '',
        fileSize: file.size,
        type: this.file.blob.type,
        name: this.file.blob.name || name,
      },
      pkg: {},
    }

    this.imgHasLoaded = this.hasLoaded()
  }

  /* 
  Checks if we need to load the image into the dom
  (To figure out it's natural sizing) 
  */
  hasLoaded() {
    return Boolean(
      this.data.original.naturalHeight && this.data.original.naturalWidth
    )
  }

  async load() {
    this.imgIsLoading = true

    /* Add invisible img to dom */
    this.file.img.style.height = '0px'
    this.file.img.style.width = '0px'
    this.file.img.style.visibility = 'none'
    addToBody(this.file.img)

    /* Wait for the image to load to get the natural dimensions */
    await imageLoad(this.file.img, this.file.url)

    /* Save image infomation to data */
    this.data.original.naturalWidth = this.file.img.naturalWidth
    this.data.original.naturalHeight = this.file.img.naturalHeight

    this.file.height = this.file.img.naturalHeight
    this.file.width = this.file.img.naturalWidth

    this.imgHasLoaded = true
    this.imgIsLoading = false

    /* Remove image from the dom */
    this.file.img.remove()

    /* Clean up styles */
    this.file.img.style.height = ''
    this.file.img.style.width = ''
    this.file.img.style.visibility = ''

    this.emit('newFiles')

    return this
  }

  getSize(name: string) {
    return this.data.pkg[name]
  }

  hasSize(name: string) {
    return !!this.getSize(name)
  }

  async createAllSizes(onProgress?: OnProgressHandler) {
    const result: { [k: string]: any } = {}

    const entries = Object.entries(this.data.sizes)

    const [nextOnProgress, innerOnProgress] = combineProgressors(2, onProgress)
    const progress = progressable(entries.length, nextOnProgress)

    for (const [sizeName, size] of entries) {
      const hasSize = this.hasSize(sizeName)

      progress(`Generating image for ${sizeName}`, true)

      if (hasSize) {
        result[sizeName] = await this.getSize(sizeName)
      } else {
        result[sizeName] = await this.createSize(size, innerOnProgress)
      }

      progress(`${sizeName} image complete`)
    }

    return result
  }

  async getImageData(
    isVector: boolean,
    processor: Processor,
    onProgress: OnProgressHandler
  ) {
    const getImageSteps = 2
    const progress = progressable(getImageSteps, onProgress)

    if (this.imageData) {
      progress('Getting image data')
      progress('Returning old image data')
      return this.imageData
    } else {
      progress('Getting image data', true)
      this.imageData = isVector
        ? await svgImgToImageData(this.file.blob)
        : await decodeImage(this.file.blob, processor)

      progress('Rotating')
      if (this.data.rotationFromOriginal) {
        this.imageData = await rotate(this.imageData, {
          rotate: this.data.rotationFromOriginal,
        })
      }
      progress('Saving processed image')

      return this.imageData
    }
  }

  async createSize(imageSize: ImageSize, onProgress?: OnProgressHandler) {
    // Special-case SVG. We need to avoid createImageBitmap because of
    // https://bugs.chromium.org/p/chromium/issues/detail?id=606319.
    // Also, we cache the HTMLImageElement so we can perform vector resizing later.

    const processingSteps = 2
    const [nextOnProgress, innerOnProgress] = combineProgressors(2, onProgress)
    const progress = progressable(processingSteps, nextOnProgress)
    const isVector = this.file.blob.type.startsWith('image/svg+xml')
    const processor = getProcessor()

    /* Create or get intialImageData */
    progress('Getting image data', true)
    let result = await this.getImageData(isVector, processor, innerOnProgress)

    const shouldResize = imageSize.name !== 'original'

    progress(
      `Resizing to ${imageSize.name} size (${imageSize.size.width}w ❎ ${
        imageSize.size.height
      }h)`
    )
    if (shouldResize) {
      let opts = {
        ...defaultResizeOptions,
        ...imageSize.size,
      } as WorkerResizeOptions

      if (opts.fit === 'contain') {
        opts = maintainAspectRatio(result, opts) as WorkerResizeOptions
      }

      result = await processor.workerResize(result, opts)
    }

    progress(`Quantizing ${imageSize.name} image`)
    const quantizerOptions = {
      ...defaultQuantizeOptions,
    }
    result = await quantizeImageData(result, quantizerOptions, processor)

    const compressOptions = this.getEncodeOptions('mozjpeg')
    const finalFile = await compressImageData(
      result,
      compressOptions,
      `${this.data.original.name}@${imageSize.name}`,
      processor
    )
    const finalImageData = await decodeImage(finalFile, processor)

    const fileContainer: FileContainer = {
      blob: finalFile,
      img: new Image(),
      url: URL.createObjectURL(finalFile),
      width: finalImageData.width,
      height: finalImageData.height,
    }

    this.files = {
      ...this.files,
      [imageSize.name]: fileContainer,
    }

    this.emit('newFiles')

    return this.files
  }

  getEncodeOptions(
    type: EncoderType
  ): {
    type: EncoderType
    options: EncoderOptions
  } {
    return {
      type,
      options: encoderMap[type].defaultOptions,
    }
  }

  destroy() {
    URL.revokeObjectURL(this.file.url)
  }
}

async function main() {
  const file = await getImage(imageUrl)

  const span = document.createElement('span')
  span.textContent = 'Loading image'
  addToBody(span)

  const imageContainer = document.createElement('div')
  addToBody(imageContainer)

  /* 
  Create an ImageObject from a file WOO
  And load file details (like width/height)
  */
  const imageObject = new ImageObject(file)
  imageObject.on('newFiles', () => {
    imageContainer.innerHTML = ''
    let html = ''
    const files = Object.entries(imageObject.files).map(
      ([sizeName, fileContainer]) => {
        html += `
          <div class="image-group">
            <img src="${fileContainer.url}"/>
            <div class="dimensions">${sizeName} size: ${
          fileContainer.width
        }w ❎ ${fileContainer.height}h</div>
            <div class="size">File size: ${humanFileSize(
              fileContainer.blob.size
            )}</div>
          </div>
        `
        return fileContainer
      }
    )

    imageContainer.innerHTML = html
  })

  await imageObject.load()

  /* Create a bunch of smaller image objects */
  const createdSizes = imageObject.createAllSizes(progress => {
    span.textContent = `${progress.percentage}%: ${progress.message}`
  })

  await createdSizes

  console.log(createdSizes)
}

function imageLoad(img: HTMLImageElement, src: string) {
  return new Promise(resolve => {
    img.onload = () => {
      img.onload = undefined
      resolve()
    }
    img.src = src
  })
}

function addToBody(element: HTMLElement) {
  window.document.body.appendChild(element)
}

function humanFileSize(size: number): string {
  const i = Math.floor(Math.log(size) / Math.log(1024))
  return (
    (size / Math.pow(1024, i)).toFixed(2) +
    ' ' +
    ['B', 'kB', 'MB', 'GB', 'TB'][i]
  )
}

main()
