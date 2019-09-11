import { SELF_RELATION } from './relation.decorator'

export interface HalLink {
  href: string;
  name?: string;
}

export interface HalLinks {
  [SELF_RELATION]: HalLink
  [rel: string]: HalLink
}
