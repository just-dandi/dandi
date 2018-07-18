import { DateTime } from 'luxon';

import { Url }  from './url';
import { Uuid } from './uuid';

export type PrimitiveType = Boolean | DateTime | Number | String | Url | Uuid;

export function isPrimitiveType(type: any): type is PrimitiveType {
    return type === Boolean ||
        type === DateTime ||
        type === Number ||
        type === Primitive ||
        type === String ||
        type === Url ||
        type === Uuid;
}

export class Primitive<T extends PrimitiveType> {
    constructor(public readonly value: T) {}
}
