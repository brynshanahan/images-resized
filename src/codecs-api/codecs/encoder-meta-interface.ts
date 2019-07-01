export default interface EncoderMeta<T extends {}> {
  type: string
  label: string
  mimeType: string
  defaultOptions: T
  extensions: string[]
  optDescription: { [k in keyof T]?: string } // Descriptions of the specified image property
  featureTest?: () => boolean | Promise<boolean>
}
