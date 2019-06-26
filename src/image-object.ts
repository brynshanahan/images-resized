import { Fileish } from 'squoosh/src/lib/initial-util'
import { ResizeOptions } from './resize'
import { RotateOptions } from './rotate'

export interface ImageObject {
  file: File | Fileish
  decoded: ImageData
  processed: ImageData
  vectorImage?: HTMLImageElement /* An image of the svg element I assume */
  options: RotateOptions & { resize: ResizeOptions }
  data: {}
}
