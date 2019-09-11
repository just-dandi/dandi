import { HalLinks } from './hal-link'

export interface HalObject {
  _links: HalLinks
  _embedded: { [rel: string]: HalObject | HalObject[] }
  [prop: string]: any
}

export function isHalObject(obj: any): obj is HalObject {
  return obj && obj._links && obj._links.self
}
