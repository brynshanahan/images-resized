import { blobToText, blobToImg } from './util/files/blob'
import { Fileish } from 'squoosh/src/lib/initial-util'
import { drawableToImageData } from './util/image/drawable-to-image-data'

async function svgBlobToImg(blob: Blob): Promise<HTMLImageElement> {
  // Firefox throws if you try to draw an SVG to canvas that doesn't have width/height.
  // In Chrome it loads, but drawImage behaves weirdly.
  // This function sets width/height if it isn't already set.
  const parser = new DOMParser()
  const text = await blobToText(blob)
  const document = parser.parseFromString(text, 'image/svg+xml')
  const svg = document.documentElement!

  if (svg.hasAttribute('width') && svg.hasAttribute('height')) {
    return blobToImg(blob)
  }

  const viewBox = svg.getAttribute('viewBox')
  if (viewBox === null) throw Error('SVG must have width/height or viewBox')

  const viewboxParts = viewBox.split(/\s+/)
  svg.setAttribute('width', viewboxParts[2])
  svg.setAttribute('height', viewboxParts[3])

  const serializer = new XMLSerializer()
  const newSource = serializer.serializeToString(document)
  return blobToImg(new Blob([newSource], { type: 'image/svg+xml' }))
}

async function svgImgToImageData(blob: File | Fileish) {
  const vectorImg = await svgBlobToImg(blob)
  return drawableToImageData(vectorImg)
}

export default svgBlobToImg
export { svgImgToImageData }
