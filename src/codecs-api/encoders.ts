import {
  optipngMeta,
  mozjpegMeta,
  webpMeta,
  browserpngMeta,
  browserjpegMeta,
  browserwebpMeta,
  browsergifMeta,
  browsertiffMeta,
  browserjp2Meta,
  browserbmpMeta,
  browserpdfMeta,
} from './codecs/codecs'

console.log({
  optipngMeta,
  mozjpegMeta,
  webpMeta,
  browserpngMeta,
  browserjpegMeta,
  browserwebpMeta,
  browsergifMeta,
  browsertiffMeta,
  browserjp2Meta,
  browserbmpMeta,
  browserpdfMeta,
})

export interface EncoderSupportMap {
  [key: string]: boolean
}

export type EncoderType = keyof typeof encoderMap

export const encoderMap = {
  [optipngMeta.type]: optipngMeta,
  [mozjpegMeta.type]: mozjpegMeta,
  [webpMeta.type]: webpMeta,
  [browserpngMeta.type]: browserpngMeta,
  [browserjpegMeta.type]: browserjpegMeta,
  [browserwebpMeta.type]: browserwebpMeta,
  // Safari & Firefox only:
  [browserbmpMeta.type]: browserbmpMeta,
  // Safari only:
  [browsergifMeta.type]: browsergifMeta,
  [browsertiffMeta.type]: browsertiffMeta,
  [browserjp2Meta.type]: browserjp2Meta,
  [browserpdfMeta.type]: browserpdfMeta,
}

export const encoders = Object.values(encoderMap)

export default function getEncodeMeta(type: keyof typeof encoderMap) {
  console.log(encoderMap, type, encoderMap[type])
  return encoderMap[type]
}

/** Does this browser support a given encoder? Indexed by label */
export const encodersSupported = Promise.resolve().then(async () => {
  const encodersSupported: EncoderSupportMap = {}

  await Promise.all(
    encoders.map(async encoder => {
      // If the encoder provides a featureTest, call it, otherwise assume supported.
      const isSupported =
        !('featureTest' in encoder) || (await encoder.featureTest())
      encodersSupported[encoder.type] = isSupported
    })
  )

  return encodersSupported
})
