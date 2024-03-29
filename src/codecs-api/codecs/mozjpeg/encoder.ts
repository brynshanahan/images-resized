import mozjpeg_enc, {
  MozJPEGModule,
} from 'squoosh/codecs/mozjpeg_enc/mozjpeg_enc'
import wasmUrl from 'squoosh/codecs/mozjpeg_enc/mozjpeg_enc.wasm'
import { EncodeOptions } from './encoder-meta'
import { initEmscriptenModule } from '../../util'

let emscriptenModule: Promise<MozJPEGModule>

export async function encode(
  data: ImageData,
  options: EncodeOptions
): Promise<ArrayBuffer> {
  if (!emscriptenModule)
    emscriptenModule = initEmscriptenModule(mozjpeg_enc, wasmUrl)

  const module = await emscriptenModule
  const resultView = module.encode(data.data, data.width, data.height, options)
  const result = new Uint8Array(resultView)
  module.free_result()

  // wasm can’t run on SharedArrayBuffers, so we hard-cast to ArrayBuffer.
  return result.buffer as ArrayBuffer
}
