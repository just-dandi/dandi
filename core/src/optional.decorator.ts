import { isConstructor } from '@dandi/common';

import { getInjectableParamMetadata, methodTarget } from './injectable.metadata';

export function optionalDecorator(target: any, propertyName: string, paramIndex: number) {
    const paramTarget = isConstructor(target) ? methodTarget(target) : target;
    const meta = getInjectableParamMetadata(paramTarget, propertyName, paramIndex);
    meta.optional = true;
}

export function Optional() {
    return optionalDecorator;
}
