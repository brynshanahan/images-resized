// Edge doesn't support `new File`, so here's a hacky alternative.
// https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/9551546/
export class Fileish extends Blob {
  constructor(data: any[], public name: string, opts?: BlobPropertyBag) {
    super(data, opts)
  }
}
