import React from 'react'
import ReactDOM from 'react-dom'
import {
  ImageContainer,
  SingleImageContainer,
  SingleImageSize
} from '../image-object'
import { humanFileSize } from './util/human-file-size'
import { getExampleImage } from './util/get-example-image'
import { RotateOptions } from 'src/codecs-api/processors/rotate/processor-meta'
import './styles/screen.scss'
import { timeToReadable } from './util/time-to-readable'
import { Fileish } from 'src/util/files/fileish'

interface State {
  files: SingleImageContainer[]
  time: number
  rotation: RotateOptions['rotate']
  imageInitialised: boolean
}

const defaultImageObjectSizes: { [k: string]: SingleImageSize } = {
  large: {
    name: 'large',
    size: {
      width: 1920,
      height: 1080,
      fit: 'contain'
    }
  },
  medium: {
    name: 'medium',
    size: {
      width: 720,
      height: 480,
      fit: 'contain'
    }
  },
  small: {
    name: 'small',
    size: {
      width: 480,
      height: 360,
      fit: 'contain'
    }
  },
  tiny: {
    name: 'tiny',
    size: {
      width: 64,
      height: 64,
      fit: 'contain'
    }
  }
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
    imageInitialised: false
  }
  onImageUpdate?: () => any
  interval: number
  imageObject?: ImageContainer
  async componentDidMount() {
    /* Get the image from a fetch.blob or file input */
    this.updateImageObject(await getExampleImage())
  }
  async updateImageObject(imageFile: File | Fileish) {
    this.setState({ imageInitialised: false })
    /* Create image object from file */
    const imageObject = ImageContainer.createFromFile(imageFile)
    imageObject.addSizes(defaultImageObjectSizes)

    /* Save to this */
    this.imageObject = imageObject

    /* When the imageObject creates a new file it will emit an update event */
    this.onImageUpdate = imageObject.on('update', () => {
      this.setState({
        files: imageObject.allFiles().sort((a, b) => a.width - b.width)
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
    const createdSizesPromise = this.imageObject.createMissingSizes()
    const startTime = Date.now()
    this.interval = setInterval(() => {
      this.setState({ time: Date.now() - startTime })
    })
    const files = await createdSizesPromise
    clearInterval(this.interval)
  }
  onChange = (e: any) => {
    if (e.target.files) {
      this.updateImageObject(e.target.files[0])
    }
  }
  render() {
    const { imageInitialised, files, time } = this.state
    const original = files.find(s => s.sizeName === 'original')
    const rest = files.filter(s => s !== original)
    return (
      <div>
        <div className="original-area">
          <div className="controllers">
            <label>
              <input type="file" onChange={this.onChange} />
            </label>
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
          {rest.map(
            ({
              url,
              fileSize,
              sizeName,
              width,
              height
            }: SingleImageContainer) => (
              <ImageGroup
                src={url}
                size={fileSize}
                name={sizeName}
                width={width}
                height={height}
                key={sizeName}
              />
            )
          )}
        </div>
      </div>
    )
  }
}

ReactDOM.render(<App />, document.querySelector('#app'))
