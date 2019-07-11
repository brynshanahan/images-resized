import { Fileish } from 'squoosh/src/lib/initial-util'
import image from '../assets/images/screenshot.jpg'

async function getImage(src: string, name: string) {
  const response = await fetch(src)
  const blob = await response.blob()
  return new Fileish([blob], name, { type: blob.type })
}

function getExampleImage() {
  return getImage(image, 'screenshot.png')
}

export { getExampleImage, getImage }
