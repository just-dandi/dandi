import { isConstructor }                                             from '@dandi/core';

import { getInjectableParamMetadata, methodTarget }                  from './injectable.metadata';
import { InjectionToken, InjectionTokenTypeError, isInjectionToken } from './injection.token';

export interface InjectDecorator<T> {
    (token: InjectionToken<T>): ParameterDecorator;
    new (token: InjectionToken<T>): InjectionToken<T>;
}

export function injectDecorator<T>(token: InjectionToken<T>, target: any, paramName: string, paramIndex: number) {
    if (!isInjectionToken(token)) {
        throw new InjectionTokenTypeError(token);
    }
    const injectTarget = isConstructor(target) ? methodTarget(target) : target;
    const meta = getInjectableParamMetadata(injectTarget, paramName, paramIndex);
    meta.token = token;
}

export function Inject<T>(token: InjectionToken<T>): ParameterDecorator {
    return injectDecorator.bind(null, token);
}
