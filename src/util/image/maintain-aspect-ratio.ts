interface Size {
  width: number
  height: number
  // [k:string]:any
}

function contains(bigSize: Size, smallSize: Size) {
  return smallSize.width <= bigSize.width && smallSize.height <= bigSize.height
}

function maintainAspectRatio(imageData: ImageData, resize: Size) {
  const { width, height } = resize
  const widthAspect = width / imageData.width
  const heightAspect = height / imageData.height

  const size = { width, height: imageData.height * widthAspect }

  if (!contains(imageData, size)) {
    size.height = height
    size.width = imageData.width * heightAspect
  }

  return {
    ...resize,
    ...size,
  }
}

export default maintainAspectRatio
