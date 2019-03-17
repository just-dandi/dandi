/**
 * A service that transforms source objects before they are used for constructing and
 * validating models with [[ModelBuilder]]
 */
export interface DataTransformer {
  transform(source: any): any
}
