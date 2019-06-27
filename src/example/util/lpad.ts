
export function lpad(str: string, padString: string, length: number) {
  while (str.length < length) str = padString + str
  return str
}