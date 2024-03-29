import webp_dec, { WebPModule } from 'squoosh/codecs/webp_dec/webp_dec'
import wasmUrl from 'squoosh/codecs/webp_dec/webp_dec.wasm'
import { initEmscriptenModule } from '../../util'

let emscriptenModule: Promise<WebPModule>

export async function decode(data: ArrayBuffer): Promise<ImageData> {
  if (!emscriptenModule)
    emscriptenModule = initEmscriptenModule(webp_dec, wasmUrl)

  const module = await emscriptenModule
  const rawImage = module.decode(data)
  const result = new ImageData(
    new Uint8ClampedArray(rawImage.buffer),
    rawImage.width,
    rawImage.height
  )

  module.free_result()
  return result
}
