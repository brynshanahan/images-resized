import { Fileish } from 'squoosh/src/lib/initial-util'
import imageUrl from '../assets/images/screenshot.png'

async function main() {
  const button = document.querySelector('#start')
  const timerEl = document.querySelector('#timer')

  const imageGroups: { [k: string]: HTMLElement } = {}

  const file = await getImage(imageUrl)

  const span = document.createElement('span')
  span.textContent = 'Loading image'
  addToBody(span)

  const imageContainer = document.createElement('div')
  addToBody(imageContainer)

  const updateUI = () => {
    const files = Object.entries(imageObject.files)
      .filter(([sizeName]) => !imageGroups[sizeName])
      .forEach(([sizeName, fileContainer]) => {
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
      })

    imageContainer.innerHTML = html
  }

  /* 
  Create an ImageObject from a file WOO
  And load file details (like width/height)
  */
  const imageObject = new ImageObject(file)

  /* Update ui when a new file is generated */
  imageObject.on('newFiles', () => updateUI())

  await imageObject.load()
  span.textContent = 'Done'

  await click(button)
  const startTime = Date.now()

  const interval = setInterval(() => {
    timerEl.textContent = timeToReadable(Date.now() - startTime)
  }, 1000)

  /* Create a bunch of smaller image objects */
  const createdSizes = imageObject.createAllSizes()

  const files = await createdSizes
  clearInterval(interval)
  timerEl.textContent = 'Done in ' + timeToReadable(Date.now() - startTime)

  console.log(files)
}

function click(element: HTMLElement | Element) {
  return new Promise(resolve => {
    const handler = () => {
      element.removeEventListener('click', handler)
      resolve()
    }
    element.addEventListener('click', handler)
  })
}

function addToBody(element: HTMLElement) {
  window.document.body.appendChild(element)
}

main()
