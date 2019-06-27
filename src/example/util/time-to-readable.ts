import { lpad } from './lpad'

export function timeToReadable(milliseconds: number) {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const leftOverSeconds = (seconds % 60) + ''

  return `${minutes}:${lpad(leftOverSeconds, '0', 2)}`
}
