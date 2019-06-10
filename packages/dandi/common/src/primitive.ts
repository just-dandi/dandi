import { DateTime } from 'luxon'

import { Currency } from './currency'
import { Url } from './url'
import { Uuid } from './uuid'

/**
 * A union type of "primitive-ish" values.
 *
 * **For the pedants:** These of course aren't all primitive types, strictly speaking, as far as JavaScript/TypeScript
 * are concerned; however, they are all types of values that can be constructed from, and represented by, a primitive
 * value, and similarly can be compared one to another as values as opposed to separate objects. This distinction exists
 * to make it easier to identify these types and compare values across the framework separately from POJOs.
 */
export type PrimitiveType = Boolean | Currency | DateTime | Number | String | Url | Uuid

/**
 * Returns `true` if `type` is one of the types represented by {@see PrimitiveType}; otherwise, false.
 * @param type The type to check
 */
export function isPrimitiveType(type: any): type is PrimitiveType {
  return (
    type === Boolean ||
    type === Currency ||
    type === DateTime ||
    type === Number ||
    type === Primitive ||
    type === String ||
    type === Url ||
    type === Uuid
  )
}

/**
 * @ignore
 */
export class Primitive<T extends PrimitiveType> {
  constructor(public readonly value: T) {}
}
