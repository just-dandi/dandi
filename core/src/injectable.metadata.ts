import { Constructor, getMetadata, MetadataAccessor } from '@dandi/common';

import { globalSymbol }    from './global.symbol';
import { InjectionToken }  from './injection.token';
import { getParamNames }   from './params.util';
import { Provider }        from './provider';

const META_KEY = globalSymbol('meta:injectable');

export type ClassMethods<T> = {
    [P in keyof T]?: T[P];
};

export type MethodTarget<T> = ClassMethods<T> & {
    constructor: Constructor<T>;
}

export function methodTarget<T>(target: Constructor<T>): MethodTarget<T> {
    return target.prototype as MethodTarget<T>;
}

export interface ParamMetadata<T> {
    name: string;
    token?: InjectionToken<T>;
    providers?: Provider<any>[];
    optional?: boolean;
}

export interface InjectableMetadata {
    paramNames?: string[];
    params: ParamMetadata<any>[];
}

export const getInjectableMetadata: MetadataAccessor<InjectableMetadata> =
    getMetadata.bind(null, META_KEY, () => ({ params: [] as ParamMetadata<any>[] }));

export function getInjectableParamMetadata<TTarget, TMetadata extends ParamMetadata<TTarget> = ParamMetadata<TTarget>>(
    target: MethodTarget<TTarget>,
    propertyName: string,
    paramIndex: number,
): TMetadata {
    const targetFn = propertyName ? target[propertyName] : target.constructor;
    const meta = getInjectableMetadata(targetFn);
    if (!meta.paramNames) {
        meta.paramNames = getParamNames(targetFn, propertyName);
    }
    if (!meta.params[paramIndex]) {
        meta.params[paramIndex] = {
            name: meta.paramNames[paramIndex],
        };
    }
    return meta.params[paramIndex] as TMetadata;
}
