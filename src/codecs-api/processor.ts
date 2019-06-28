import { proxy } from 'comlink'
import { QuantizeOptions } from './imagequant/processor-meta'
// import { canvasEncode, blobToArrayBuffer } from '../lib/util'
import { EncodeOptions as MozJPEGEncoderOptions } from './codecs/mozjpeg/encoder-meta'
import { EncodeOptions as OptiPNGEncoderOptions } from './optipng/encoder-meta'
import { EncodeOptions as WebPEncoderOptions } from './webp/encoder-meta'
import { EncodeOptions as BrowserJPEGOptions } from './codecs/browser-jpeg/encoder-meta'
import { EncodeOptions as BrowserWebpEncodeOptions } from './codecs/browser-webp/encoder-meta'
import {
  BrowserResizeOptions,
  VectorResizeOptions,
} from './resize/processor-meta'
import { browserResize, vectorResize } from './resize/processor-sync'
import * as browserBMP from './codecs/browser-bmp/encoder'
import * as browserPNG from './codecs/browser-png/encoder'
import * as browserJPEG from './codecs/browser-jpeg/encoder'
import * as browserWebP from './codecs/browser-webp/encoder'
import * as browserGIF from './codecs/browser-gif/encoder'
import * as browserTIFF from './codecs/browser-tiff/encoder'
import * as browserJP2 from './codecs/browser-jp2/encoder'
import * as browserPDF from './codecs/browser-pdf/encoder'
import { canvasEncode } from 'src/util/canvas/canvas-encode'
import { blobToArrayBuffer } from 'src/util/files/blob'

type ProcessorWorkerApi = import('./image-worker/image-worker').ProcessorWorkerApi

/** How long the worker should be idle before terminating. */
const workerTimeout = 10000

interface ProcessingJobOptions {
  needsWorker?: boolean
}

export default class Processor {
  /** Worker instance associated with this processor. */
  private worker?: Worker
  /** Comlinked worker API. */
  private workerApi?: ProcessorWorkerApi
  /** Rejector for a pending promise. */
  private abortRejector?: (err: Error) => void
  /** Is work currently happening? */
  private working = false
  /** Incementing ID so we can tell if a job has been superseded. */
  private latestJobId: number = 0
  /** setTimeout ID for killing the worker when idle. */
  private workerTimeoutId: number = 0

  private processingJob(options: ProcessingJobOptions = {}) {
    return async (callback: () => any) => {
      const { needsWorker = false } = options

      this.latestJobId += 1
      const jobId = this.latestJobId

      if (needsWorker) self.clearTimeout(this.workerTimeoutId)

      if (!this.worker && needsWorker) {
        this.worker = new Worker('./image-worker/image-worker', {
          name: 'process-worker',
          type: 'module',
        }) as Worker
        this.workerApi = (proxy(this.worker) as any) as ProcessorWorkerApi
      }

      this.working = true

      const finalResult = Promise.race([
        callback(),
        new Promise((_, reject) => {
          this.abortRejector = reject
        }),
      ])

      /* We dont care about the error */
      await finalResult.catch(() => {})

      if (this.latestJobId === jobId) {
        this.jobCleanup()
      }

      return finalResult
    }
  }

  private workerJob = this.processingJob({ needsWorker: true })
  private job = this.processingJob()

  private jobCleanup(): void {
    this.working = false

    if (!this.worker) return

    // If the worker is unused for 10 seconds, remove it to save memory.
    this.workerTimeoutId = self.setTimeout(() => {
      if (!this.worker) return
      this.worker.terminate()
      this.worker = undefined
    }, workerTimeout)
  }

  /** Abort the current job, if any */
  abortCurrent() {
    if (!this.working) return
    if (!this.abortRejector)
      throw Error("There must be a rejector if it's busy")
    this.abortRejector(new DOMException('Aborted', 'AbortError'))
    this.abortRejector = undefined
    this.working = false

    if (!this.worker) return
    this.worker.terminate()
    this.worker = undefined
  }

  // Off main thread jobs:
  imageQuant(data: ImageData, opts: QuantizeOptions): Promise<ImageData> {
    return this.workerJob(() => this.workerApi.processors.quantize(data, opts))
  }

  rotate(
    data: ImageData,
    opts: import('./rotate/processor-meta').RotateOptions
  ): Promise<ImageData> {
    return this.workerJob(() => this.workerApi.processors.rotate(data, opts))
  }

  workerResize(
    data: ImageData,
    opts: import('./resize/processor-meta').WorkerResizeOptions
  ): Promise<ImageData> {
    return this.workerJob(() => {
      return this.workerApi.processors.resize(data, opts)
    })
  }

  mozjpegEncode(
    data: ImageData,
    opts: MozJPEGEncoderOptions
  ): Promise<ArrayBuffer> {
    return this.workerJob(() => this.workerApi.encoders.mozjpegEncode(data, opts))
  }

  optiPngEncode(
    data: ImageData,
    opts: OptiPNGEncoderOptions
  ): Promise<ArrayBuffer> {
    return this.workerJob(async () => {
      // OptiPNG expects PNG input.
      const pngBlob = await canvasEncode(data, 'image/png')
      const pngBuffer = await blobToArrayBuffer(pngBlob)
      return this.workerApi.encoders.optiPngEncode(pngBuffer, opts)
    })
  }

  webpEncode(data: ImageData, opts: WebPEncoderOptions): Promise<ArrayBuffer> {
    return this.workerJob(() => this.workerApi.encoders.webpEncode(data, opts))
  }

  webpDecode(blob: Blob): Promise<ImageData> {
    return this.workerJob(async () => {
      const data = await blobToArrayBuffer(blob)
      return this.workerApi.decoders.webpDecode(data)
    })
  }

  // Not-worker jobs:
  browserBmpEncode(data: ImageData): Promise<Blob> {
    return this.job(() => browserBMP.encode(data))
  }

  browserPngEncode(data: ImageData): Promise<Blob> {
    return this.job(() => browserPNG.encode(data))
  }

  browserJpegEncode(data: ImageData, opts: BrowserJPEGOptions): Promise<Blob> {
    return this.job(() => browserJPEG.encode(data, opts))
  }

  browserWebpEncode(
    data: ImageData,
    opts: BrowserWebpEncodeOptions
  ): Promise<Blob> {
    return this.job(() => browserWebP.encode(data, opts))
  }

  browserGifEncode(data: ImageData): Promise<Blob> {
    return this.job(() => browserGIF.encode(data))
  }

  browserTiffEncode(data: ImageData): Promise<Blob> {
    return this.job(() => browserTIFF.encode(data))
  }

  browserJp2Encode(data: ImageData): Promise<Blob> {
    return this.job(() => browserJP2.encode(data))
  }

  browserPdfEncode(data: ImageData): Promise<Blob> {
    return this.job(() => browserPDF.encode(data))
  }

  // Synchronous jobs
  resize(data: ImageData, opts: BrowserResizeOptions) {
    this.abortCurrent()
    return browserResize(data, opts)
  }

  vectorResize(data: HTMLImageElement, opts: VectorResizeOptions) {
    this.abortCurrent()
    return vectorResize(data, opts)
  }
}
