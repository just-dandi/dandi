/**
 * A function that transforms an object key
 */
export type KeyTransformFn = (key: string) => string

/**
 * A service that transforms source objects before they are used for constructing and
 * validating models with {@see ModelBuilder}
 */
export interface DataTransformer {
  transform(source: any): any
}
