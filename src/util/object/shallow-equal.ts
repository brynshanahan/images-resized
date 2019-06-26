/**
 * Compare two objects, returning a boolean indicating if
 *  they have the same properties and strictly equal values.
 */
export function shallowEqual(one: any, two: any) {
  for (const i in one) if (one[i] !== two[i]) return false
  for (const i in two) if (!(i in one)) return false
  return true
}
