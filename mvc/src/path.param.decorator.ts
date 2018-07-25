import { InjectionToken, Provider } from '@dandi/core';
import { MemberMetadata }           from '@dandi/model';
import { ValidatedType }            from '@dandi/model-validation';

import { requestParamDecorator, requestParamProvider, requestParamToken } from './request.param.decorator';
import { RequestPathParamMap } from './tokens';

export function PathParam(type?: ValidatedType, name?: string): ParameterDecorator {
    return requestParamDecorator.bind(null, RequestPathParamMap, type || String, name);
}

export function pathParamToken<T>(paramName: string, requestParamName: string): InjectionToken<T> {
    return requestParamToken(RequestPathParamMap, paramName, requestParamName);
}

export function pathParamProvider<T>(paramToken: InjectionToken<T>, type: ValidatedType, paramName: string, memberMetadata: MemberMetadata): Provider<T> {
    return requestParamProvider(RequestPathParamMap, paramToken, type, paramName, memberMetadata);
}
