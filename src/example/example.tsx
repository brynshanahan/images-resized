import React from 'react'
import ReactDOM from 'react-dom'
import { ImageObject, ImageInfo } from '../image-object'
import { FileContainer } from '../file-container'
import { humanFileSize } from './util/human-file-size'
import { getExampleImage } from './util/get-example-image'
import { RotateOptions } from 'src/codecs-api/rotate/processor-meta'
import './styles/screen.scss'
import { timeToReadable } from './util/time-to-readable'

interface State {
  files: ImageInfo[]
  time: number
  rotation: RotateOptions['rotate']
  imageInitialised: boolean
}

const ImageGroup = ({ src, name, width, height, size }: any) => {
  return (
    <div className="image-group">
      <img src={src} />
      <div className="info">
        <div className="dimensions">
          {name} size: {width}w ❎ {height}h
        </div>
        <div className="size">{humanFileSize(size)}</div>
      </div>
    </div>
  )
}

class App extends React.Component {
  state: State = {
    files: [],
    time: 0,
    rotation: 0,
    imageInitialised: false,
  }
  onImageUpdate?: () => any
  interval: number
  imageObject?: ImageObject
  async componentDidMount() {
    /* Get the image from a fetch.blob or file input */
    const imageFile = await getExampleImage()

    /* Create image object from file */
    const imageObject = new ImageObject(imageFile, imageFile.name, {
      rotation: this.state.rotation,
    })

    /* Save to this */
    this.imageObject = imageObject

    /* When the imageObject creates a new file it will emit an update event */
    this.onImageUpdate = imageObject.on('update', () => {
      this.setState({
        files: imageObject.allFiles().sort((a, b) => a.width - b.width),
      })
    })

    /* 
    Load the initial image to get the image dimensions. 
    Only required if the original image doesn't exist
    */
    await this.imageObject.initialLoad()

    /* Show processor button */
    this.setState({ imageInitialised: true })
  }
  componentWillUnmount() {
    this.onImageUpdate && this.onImageUpdate()
  }
  processFiles = async () => {
    console.log('creating sizes')
    const createdSizesPromise = this.imageObject.createAllSizes()
    const startTime = Date.now()
    this.interval = setInterval(() => {
      this.setState({ time: Date.now() - startTime })
    })
    const files = await createdSizesPromise
    clearInterval(this.interval)
  }
  render() {
    const { imageInitialised, files, time } = this.state
    const original = files.find(s => s.sizeName === 'original')
    const rest = files.filter(s => s !== original)
    return (
      <div>
        <div className="original-area">
          <div className="controllers">
            {imageInitialised && (
              <button id="start" onClick={this.processFiles}>
                Start image processing
              </button>
            )}
            <span className="timer">{timeToReadable(time)}</span>
          </div>
          {original && (
            <ImageGroup
              src={original.url}
              size={original.fileSize}
              name={original.sizeName}
              width={original.width}
              height={original.height}
              key={original.sizeName}
            />
          )}
        </div>
        <div className="images">
          {rest.map(({ url, fileSize, sizeName, width, height }: ImageInfo) => (
            <ImageGroup
              src={url}
              size={fileSize}
              name={sizeName}
              width={width}
              height={height}
              key={sizeName}
            />
          ))}
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))