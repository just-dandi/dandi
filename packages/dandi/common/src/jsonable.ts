/**
 * Defines an object that customizes its JSON serialization behavior
 *
 * See the [toJSON() documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior)
 * for more information.
 */
export interface Jsonable {

  /**
   * Returns an object to use for JSON serializing instead of the object instance.
   *
   * See the [toJSON() documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#toJSON()_behavior)
   * for more information.
   */
  toJSON(): any
}

/**
 * Returns `true` if `obj` implements the {@see toJSON} function; otherwise, `false`.
 * @param obj The object to check
 */
export function isJsonable(obj: any): obj is Jsonable {
  if (!obj) {
    return false
  }
  return typeof obj.toJSON === 'function'
}
