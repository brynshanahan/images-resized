export function getContainOffsets(
  startWidth: number,
  startHeight: number,
  endWidth: number,
  endHeight: number
) {
  const currentAspect = startWidth / startHeight
  const endAspect = endWidth / endHeight

  if (endAspect > currentAspect) {
    const newSh = startWidth / endAspect
    const newSy = (startHeight - newSh) / 2
    return { sw: startWidth, sh: newSh, sx: 0, sy: newSy }
  }

  const newSw = startHeight * endAspect
  const newSx = (startWidth - newSw) / 2
  return { sh: startHeight, sw: newSw, sx: newSx, sy: 0 }
}
