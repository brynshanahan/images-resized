import { Fileish } from 'squoosh/src/lib/initial-util'

interface FileContainer {
  blob: File | Fileish
  url: string
  width: number
  height: number
}

export { FileContainer }
