import * as Comlink from 'comlink'

/* 
This file is a web worker. It's functions are exposed by comlink
*/
const WorkerAPI = {
  codecs: {
    async webpDecode(data: ArrayBuffer): Promise<ImageData> {
      const { decode } = await import(
        /* webpackChunkName: "process-webp-dec" */
        '../codecs/webp/decoder'
      )
      return decode(data)
    },
    async mozjpegEncode(
      data: ImageData,
      options: import('../codecs/mozjpeg/encoder-meta').EncodeOptions
    ): Promise<ArrayBuffer> {
      const { encode } = await import(
        /* webpackChunkName: "process-mozjpeg-enc" */
        '../codecs/mozjpeg/encoder'
      )
      return encode(data, options)
    },
    async optiPngEncode(
      data: BufferSource,
      options: import('../codecs/optipng/encoder-meta').EncodeOptions
    ): Promise<ArrayBuffer> {
      const { compress } = await import(
        /* webpackChunkName: "process-optipng" */
        '../codecs/optipng/encoder'
      )
      return compress(data, options)
    },
    async webpEncode(
      data: ImageData,
      options: import('../codecs/webp/encoder-meta').EncodeOptions
    ): Promise<ArrayBuffer> {
      const { encode } = await import(
        /* webpackChunkName: "process-webp-enc" */
        '../codecs/webp/encoder'
      )
      return encode(data, options)
    },
  },
  processors: {
    async quantize(
      data: ImageData,
      opts: import('../processors/imagequant/processor-meta').QuantizeOptions
    ): Promise<ImageData> {
      const { process } = await import(
        /* webpackChunkName: "process-imagequant" */
        '../processors/imagequant/processor'
      )
      return process(data, opts)
    },
    async rotate(
      data: ImageData,
      opts: import('../processors/rotate/processor-meta').RotateOptions
    ): Promise<ImageData> {
      const { rotate } = await import(
        /* webpackChunkName: "process-rotate" */
        '../processors/rotate/processor'
      )

      return rotate(data, opts)
    },
    async resize(
      data: ImageData,
      opts: import('../processors/resize/processor-meta').WorkerResizeOptions
    ): Promise<ImageData> {
      const { resize } = await import(
        /* webpackChunkName: "process-resize" */
        '../processors/resize/processor'
      )

      return resize(data, opts)
    },
  },
}

export type ProcessorWorkerApi = typeof WorkerAPI

Comlink.expose(WorkerAPI, self)
