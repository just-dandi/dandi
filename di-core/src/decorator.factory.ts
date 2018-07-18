import { Constructor } from '@dandi/core';

export function decoratorFactory<TDecValue, TTarget>(
    decKey: symbol,
    decValue: TDecValue,
    target: Constructor<TTarget>,
    propertKey?: string,
    propertyIndex?: number,
) {

}
