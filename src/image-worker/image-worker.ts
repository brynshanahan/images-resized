import * as Comlink from 'comlink'

/* 
This file is a web worker. It's functions are exposed by comlink
*/
const WorkerAPI = {
  codecs: {
    async webpDecode(data: ArrayBuffer): Promise<ImageData> {
      const { decode } = await import(
        /* webpackChunkName: "process-webp-dec" */
        '../codecs-api/codecs/webp/decoder'
      )
      return decode(data)
    },
    async mozjpegEncode(
      data: ImageData,
      options: import('../codecs-api/codecs/mozjpeg/encoder-meta').EncodeOptions
    ): Promise<ArrayBuffer> {
      const { encode } = await import(
        /* webpackChunkName: "process-mozjpeg-enc" */
        '../codecs-api/codecs/mozjpeg/encoder'
      )
      return encode(data, options)
    },
    async optiPngEncode(
      data: BufferSource,
      options: import('../codecs-api/codecs/optipng/encoder-meta').EncodeOptions
    ): Promise<ArrayBuffer> {
      const { compress } = await import(
        /* webpackChunkName: "process-optipng" */
        '../codecs-api/codecs/optipng/encoder'
      )
      return compress(data, options)
    },
    async webpEncode(
      data: ImageData,
      options: import('../codecs-api/codecs/webp/encoder-meta').EncodeOptions
    ): Promise<ArrayBuffer> {
      const { encode } = await import(
        /* webpackChunkName: "process-webp-enc" */
        '../codecs-api/codecs/webp/encoder'
      )
      return encode(data, options)
    }
  },
  processors: {
    async quantize(
      data: ImageData,
      opts: import('../codecs-api/processors/imagequant/processor-meta').QuantizeOptions
    ): Promise<ImageData> {
      const { process } = await import(
        /* webpackChunkName: "process-imagequant" */
        '../codecs-api/processors/imagequant/processor'
      )
      return process(data, opts)
    },
    async rotate(
      data: ImageData,
      opts: import('../codecs-api/processors/rotate/processor-meta').RotateOptions
    ): Promise<ImageData> {
      const { rotate } = await import(
        /* webpackChunkName: "process-rotate" */
        '../codecs-api/processors/rotate/processor'
      )

      return rotate(data, opts)
    },
    async resize(
      data: ImageData,
      opts: import('../codecs-api/processors/resize/processor-meta').WorkerResizeOptions
    ): Promise<ImageData> {
      const { resize } = await import(
        /* webpackChunkName: "process-resize" */
        '../codecs-api/processors/resize/processor'
      )

      return resize(data, opts)
    }
  }
}

export type ProcessorWorkerApi = typeof WorkerAPI

Comlink.expose(WorkerAPI, self)
