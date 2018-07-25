import { InjectionToken, Provider } from '@dandi/core';
import { MemberMetadata }           from '@dandi/model';
import { ValidatedType }            from '@dandi/model-validation';

import { requestParamDecorator, requestParamProvider, requestParamToken } from './request.param.decorator';
import { RequestQueryParamMap } from './tokens';

export function QueryParam<T>(type?: ValidatedType, name?: string): ParameterDecorator {
    return requestParamDecorator.bind(null, RequestQueryParamMap, type || String, name);
}

export function queryParamToken<T>(paramName: string, requestParamName: string): InjectionToken<T> {
    return requestParamToken(RequestQueryParamMap, paramName, requestParamName);
}

export function queryParamProvider<T>(paramToken: InjectionToken<T>, type: ValidatedType, paramName: string, memberMetadata: MemberMetadata): Provider<T> {
    return requestParamProvider(RequestQueryParamMap, paramToken, type, paramName, memberMetadata);
}
