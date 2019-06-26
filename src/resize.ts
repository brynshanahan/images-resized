import { Fileish } from 'squoosh/src/lib/initial-util'
import { RotateOptions } from './rotate'
import Processor from './codecs-api/processor'

type BrowserResizeMethods =
  | 'browser-pixelated'
  | 'browser-low'
  | 'browser-medium'
  | 'browser-high'
type WorkerResizeMethods = 'triangle' | 'catrom' | 'mitchell' | 'lanczos3'
const workerResizeMethods: WorkerResizeMethods[] = [
  'triangle',
  'catrom',
  'mitchell',
  'lanczos3',
]

export interface ResizeOptionsCommon {
  width: number
  height: number
  fit: 'stretch' | 'contain'
}

export interface BrowserResizeOptions extends ResizeOptionsCommon {
  method: BrowserResizeMethods
}

export interface WorkerResizeOptions extends ResizeOptionsCommon {
  method: WorkerResizeMethods
  premultiply: boolean
  linearRGB: boolean
}

export interface VectorResizeOptions extends ResizeOptionsCommon {
  method: 'vector'
}

export type ResizeOptions =
  | BrowserResizeOptions
  | WorkerResizeOptions
  | VectorResizeOptions

export function isWorkerResizeMethod(
  options: ResizeOptions
): options is WorkerResizeOptions {
  return (workerResizeMethods as string[]).includes(options.method)
}

export function isVectorResizeMethod(
  options: ResizeOptions
): options is VectorResizeOptions {
  return options.method === 'vector'
}

export const defaultOptions: ResizeOptions = {
  width: 1,
  height: 1,
  method: 'lanczos3',
  fit: 'contain',
  premultiply: true,
  linearRGB: true,
}

async function resizeVector(
  vectorImage: HTMLImageElement,
  options: VectorResizeOptions,
  processor: Processor
) {
  await processor.vectorResize(vectorImage, options)
}

async function resizeImageData(
  imageData: ImageData,
  options: BrowserResizeOptions | WorkerResizeOptions,
  processor: Processor
) {
  const config = { ...defaultOptions, ...options }
  if (isWorkerResizeMethod(options)) {
    return await processor.workerResize(imageData, config)
  } else {
    return processor.resize(imageData, config as BrowserResizeOptions)
  }
}

export { resizeImageData, resizeVector }
