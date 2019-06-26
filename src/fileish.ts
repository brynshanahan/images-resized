export class Fileish extends Blob {
  constructor(data: any[], public name: string, opts?: BlobPropertyBag) {
    super(data, opts)
  }
}
