import { Fileish } from 'squoosh/src/lib/initial-util'
import { ResizeOptions, resizeImageData } from './resize'
import { FileContainer } from './file-container'
import { sniffMimeType } from './util/files/sniff-mime-type'
import Processor from './processor'
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
import Subject from './util/reactive/subject'
import maintainAspectRatio from './util/image/maintain-aspect-ratio'
import { encode } from './codecs-api/codecs/browser-png/encoder'
import getEncodeMeta from './codecs-api/encoders'

export interface SingleImageContainer {
  width: number
  height: number
  sizeName: string
  fit: string
  url: string
  fileSize: number
  type: string
  name: string
}

export interface SingleImageSize {
  name: string
  size: {
    width: number
    height: number
    fit: 'contain' | 'stretch'
  }
}

interface ImageInfoContainer {
  rotationFromOriginal: RotateOptions['rotate']
  sizes: {
    [k: string]: SingleImageSize
  }
  margin: number // The amount of room left between generated images as a decimal percentage
  original?: Partial<SingleImageContainer>
  isVector?: boolean
  pkg: {
    [k: string]: SingleImageContainer
  }
}

const processors = {
  load: new Processor(),
  compress: new Processor(),
  quantize: new Processor(),
  resize: new Processor(),
  decode: new Processor()
}

const defaultImageContainerOpts: ImageInfoContainer = {
  rotationFromOriginal: 0,
  pkg: {},
  sizes: {},
  margin: 0.2
}

export class ImageContainer extends Subject {
  originalFile: File | Fileish
  files: { [k: string]: FileContainer }
  data: ImageInfoContainer

  /* imageData is created and cached on the object */
  imageData?: ImageData

  /* Used to stop two quick init calls */
  initializing: boolean

  /* When doing processing we will always have to download the original first */
  originalHasInitialized: boolean
  isVector: boolean

  /* 
  There is no method for getting an image from a url, 
  but it can be implemented in userland by useing fetch.blob() 
  */
  static createFromFile(blob: File | Fileish, name: string = '') {
    if (!name && !blob.name) {
      console.warn(
        'No file name given to `ImageContainer.createFromFile(file:File|Blob, name:string)`'
      )
    }

    const file = new Fileish([blob], name || blob.name || `unknown`, {
      type: blob.type
    })

    return new ImageContainer(
      clone(defaultImageContainerOpts, {
        original: {
          name: name || blob.name || `unknown`
        }
      }),
      file
    )
  }

  constructor(data: ImageInfoContainer, private _file?: File | Fileish) {
    super()

    this.files = {}

    /* Data has to be json friendly */
    this.data = data

    /* 
    _file should never be passed from third party code. 
    ImageContainers should be made with ImageContainer.createFromFile(file) 
    */
    if (_file) {
      this.originalFile = _file

      const original: SingleImageContainer = {
        width: 0,
        height: 0,
        url: '',
        fit: 'contain',
        sizeName: 'original',
        fileSize: this.originalFile.size,
        type: this.originalFile.type,
        name: this.originalFile.name || name
      }

      this.data.original = original
      this.data.pkg.original = original
    }

    /* Will control loading */
    this.originalHasInitialized = this.originalIsInitialized()
  }

  /* 
  Checks if we need to load the image into the dom
  (To figure out it's natural sizing) 
  */
  originalIsInitialized() {
    return Boolean(
      this.data.original &&
        this.data.original.width &&
        this.data.original.height
    )
  }

  async getOriginalAsFile() {
    if (this.originalFile) {
      this.originalFile
    } else {
      this.originalFile = await fileFromUrl(
        this.data.original.url,
        this.data.original.name
      )
    }

    this.isVector = this.originalFile.type.startsWith('image/svg+xml')
    return this.originalFile
  }

  /* Shouldn't really need to load this on the front end */
  async initialLoad() {
    if (this.originalHasInitialized) return

    await this.getOriginalAsFile()

    this.initializing = true

    const { width, height } = await decodeImage(
      this.originalFile,
      new Processor()
    )

    /* Save image infomation to data */
    this.data.original.width = width
    this.data.original.height = height
    this.data.original.url = URL.createObjectURL(this.originalFile)

    this.originalHasInitialized = true
    this.initializing = false

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

  async createMissingSizes() {
    const entries = Object.entries(this.data.sizes).filter(
      ([sizeName]) => !this.hasSize(sizeName)
    )

    /* Fetches image data */
    await this.getImageData(this.isVector, processors.load)

    const results: Promise<SingleImageContainer>[] = []

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
      ? await svgImgToImageData(this.originalFile)
      : await decodeImage(this.originalFile, processor)

    console.log('Rotating')
    if (this.data.rotationFromOriginal) {
      this.imageData = await rotate(this.imageData, {
        rotate: this.data.rotationFromOriginal
      })
    }
    console.log('Finished rotating')

    return this.imageData
    // }
  }

  addSizes(sizes: { [k: string]: SingleImageSize }) {
    this.data.sizes = {
      ...this.data.sizes,
      ...sizes
    }
  }

  async createSize(imageSize: SingleImageSize, argProcessor?: Processor) {
    console.log('Creating', imageSize)

    // Special-case SVG. We need to avoid createImageBitmap because of
    // https://bugs.chromium.org/p/chromium/issues/detail?id=606319.
    // Also, we cache the HTMLImageElement so we can perform vector resizing later.
    const isVector = this.isVector

    /* Create or get intialImageData */
    console.log('Getting image data')
    let result = await this.getImageData(isVector, processors.load)

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
        linearRGB: false
        // method: "lanczos3"
      } as WorkerResizeOptions

      if (opts.fit === 'contain') {
        opts = maintainAspectRatio(result, opts) as WorkerResizeOptions
      }

      result = await resizeImageData(result, opts, processors.resize)
    }

    console.log(`Quantizing ${imageSize.name} image`)
    const quantizerOptions = {
      ...defaultQuantizeOptions
    }
    result = await quantizeImageData(
      result,
      quantizerOptions,
      processors.quantize
    )

    const mozjpeg = getEncodeMeta('mozjpeg')
    const finalFile = await compressImageData(
      result,
      mozjpeg.type,
      mozjpeg.defaultOptions,
      `${imageSize.name}@${this.data.original.name}`,
      processors.compress
    )

    // const finalImageData = result
    // const finalFile = await encode(result)

    // console.log(finalFile)

    const finalImageData = await decodeImage(finalFile, processors.decode)

    const fileContainer: FileContainer = {
      blob: finalFile,
      url: URL.createObjectURL(finalFile),
      width: finalImageData.width,
      height: finalImageData.height
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
      url: fileContainer.url
    }

    this.emit('update')

    return this.data.pkg[imageSize.name]
  }

  destroy() {
    URL.revokeObjectURL(this.data.original.url)
  }
}

function fileFromUrl(url: string, name?: string) {
  return fetch(url)
    .then(response => response.blob())
    .then(blob => {
      return new Fileish([blob], name || url.split('/').pop(), {
        type: blob.type
      })
    })
}

function clone(...args: { [k: string]: any }[]) {
  return Object.assign({}, ...args)
}
