import { Fileish } from 'squoosh/src/lib/initial-util'
import { ResizeOptions, resizeImageData } from './resize'
import { FileContainer } from './file-container'
import { sniffMimeType } from './util/files/sniff-mime-type'
import Processor from './codecs-api/processor'
import svgBlobToImg, { svgImgToImageData } from './svg-to-image'
import { drawableToImageData } from './util/image/drawable-to-image-data'
import { decodeImage } from './codecs-api/decoders'
import { rotate } from './codecs-api/processors/rotate/processor'
import { RotateOptions } from './codecs-api/processors/rotate/processor-meta'
import { resize } from './codecs-api/processors/resize/processor'
import { defaultResizeOptions } from './codecs-api/processors/resize/processor-meta'
import { WorkerResizeOptions } from './resize'
import quantizeImageData, { defaultQuantizeOptions } from './quantize'
import compressImageData from './compress'
import getEncodeMeta from './codecs-api/encoders'
import Subject from './util/reactive/subject'
import maintainAspectRatio from './util/image/maintain-aspect-ratio'
import { encode } from './codecs-api/codecs/browser-png/encoder'

const defaultImageObjectSizes: { [k: string]: ImageSize } = {
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

export interface ImageInfo {
  width: number
  height: number
  sizeName: string
  fit: string
  url: string
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

export interface ImageObjectOptions {
  rotation: RotateOptions['rotate']
}

const defaultImageObjectOptions: ImageObjectOptions = {
  rotation: 0,
}

let processor: false | Processor = false

const getProcessor = (): Processor => {
  if (!processor) {
    processor = new Processor()
  }
  return processor
}

export class ImageObject extends Subject {
  file: File | Fileish
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

  constructor(
    file: Fileish | File,
    name: string = 'unknown',
    optionsArg: Partial<ImageObjectOptions> = {}
  ) {
    super()

    const options: ImageObjectOptions = {
      ...defaultImageObjectOptions,
      ...optionsArg,
    }

    this.file = file
    this.files = {}

    this.isVector = this.file.type.startsWith('image/svg+xml')

    const original: ImageInfo = {
      width: 0,
      height: 0,
      url: '',
      fit: 'contain',
      sizeName: 'original',
      fileSize: file.size,
      type: this.file.type,
      name: this.file.name || name,
    }

    /* Data will be serialized to the db */
    this.data = {
      /* Declare what sizes you want to exist */
      sizes: defaultImageObjectSizes,
      rotationFromOriginal: options.rotation,
      original,
      pkg: {
        original,
      },
    }

    this.imgHasLoaded = this.hasLoaded()
  }

  /* 
  Checks if we need to load the image into the dom
  (To figure out it's natural sizing) 
  */
  hasLoaded() {
    return Boolean(this.data.original.width && this.data.original.height)
  }

  async initialLoad() {
    this.imgIsLoading = true

    const { width, height } = await decodeImage(this.file, getProcessor())

    /* Wait for the image to load to get the natural dimensions */

    /* Save image infomation to data */
    this.data.original.width = width
    this.data.original.height = height
    this.data.original.url = URL.createObjectURL(this.file)

    this.imgHasLoaded = true
    this.imgIsLoading = false

    this.emit('update')

    return this
  }

  allFiles() {
    return Object.values(this.data.pkg)
  }

  async getImageForSize(
    size: { width: number } | number,
    callback: (url: string) => any
  ) {
    if (typeof size === 'number') {
      const files = this.allFiles()
      const index = files.findIndex(el)
    }
  }

  getSize(name: string) {
    return this.data.pkg[name]
  }

  hasSize(name: string) {
    return !!this.getSize(name)
  }

  async createAllSizes() {
    const entries = Object.entries(this.data.sizes).filter(
      ([sizeName]) => !this.hasSize(sizeName)
    )

    /* Fetches image data */
    await this.getImageData(this.isVector, getProcessor())

    const results: Promise<ImageInfo>[] = []

    for (const i in entries) {
      const [sizeName, size] = entries[i]
      const hasSize = this.hasSize(sizeName)
      let result

      console.log(`Generating image for ${sizeName}`, true)

      if (hasSize) {
        result = Promise.resolve(this.getSize(sizeName))
      } else {
        result = this.createSize(size, new Processor())
      }

      results.push(result)
    }

    return Promise.all(results)
  }

  async getImageData(isVector: boolean, processor: Processor) {
    // if (this.imageData) {
    //   console.log('Using cached image data', this.imageData)
    //   return this.imageData
    // } else {
    console.log('Getting image data', true)
    this.imageData = isVector
      ? await svgImgToImageData(this.file)
      : await decodeImage(this.file, processor)

    console.log('Rotating')
    if (this.data.rotationFromOriginal) {
      this.imageData = await rotate(this.imageData, {
        rotate: this.data.rotationFromOriginal,
      })
    }
    console.log('Finished rotating')

    return this.imageData
    // }
  }

  async createSize(imageSize: ImageSize, argProcessor?: Processor) {
    // Special-case SVG. We need to avoid createImageBitmap because of
    // https://bugs.chromium.org/p/chromium/issues/detail?id=606319.
    // Also, we cache the HTMLImageElement so we can perform vector resizing later.
    const processor = argProcessor || getProcessor()
    const isVector = this.isVector

    /* Create or get intialImageData */
    console.log('Getting image data')
    let result = await this.getImageData(isVector, processor)

    const shouldResize = imageSize.name !== 'original'

    console.log(
      `Resizing to ${imageSize.name} size (${imageSize.size.width}w ❎ ${
        imageSize.size.height
      }h)`
    )
    if (shouldResize) {
      let opts = {
        ...defaultResizeOptions,
        ...imageSize.size,
        // premultiply: false,
        linearRGB: false,
        // method: "lanczos3"
      } as WorkerResizeOptions

      if (opts.fit === 'contain') {
        opts = maintainAspectRatio(result, opts) as WorkerResizeOptions
      }

      result = await resizeImageData(result, opts, processor)
    }

    console.log(`Quantizing ${imageSize.name} image`)
    const quantizerOptions = {
      ...defaultQuantizeOptions,
    }
    result = await quantizeImageData(result, quantizerOptions, processor)

    const mozjpeg = getEncodeMeta('mozjpeg')
    const finalFile = await compressImageData(
      result,
      mozjpeg.type,
      mozjpeg.defaultOptions,
      `${imageSize.name}@${this.data.original.name}`,
      processor
    )

    // const finalImageData = result
    // const finalFile = await encode(result)

    // console.log(finalFile)

    const finalImageData = await decodeImage(finalFile, processor)

    const fileContainer: FileContainer = {
      blob: finalFile,
      url: URL.createObjectURL(finalFile),
      width: finalImageData.width,
      height: finalImageData.height,
    }

    this.files[imageSize.name] = fileContainer

    this.data.pkg[imageSize.name] = {
      sizeName: imageSize.name,
      width: finalImageData.width,
      height: finalImageData.height,
      fileSize: finalFile.size,
      type: finalFile.type,
      fit: imageSize.size.fit,
      name: finalFile.name,
      url: fileContainer.url,
    }

    this.emit('update')

    return this.data.pkg[imageSize.name]
  }

  destroy() {
    URL.revokeObjectURL(this.data.original.url)
  }
}
