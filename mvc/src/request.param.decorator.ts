import { getInjectableParamMetadata, InjectionToken, MethodTarget, Provider } from '@dandi/core';
import { getMemberMetadata, MemberMetadata } from '@dandi/model';
import { TypeValidator, ValidatedType } from '@dandi/model-validation';

import { localSymbolTokenFor } from './local.token';
import { requestParamValidatorFactory } from './request.param.validator';
import { ParamMap } from './tokens';

export function requestParamToken<T>(mapToken: InjectionToken<ParamMap>, paramName: string, requestParamName: string) {
  return localSymbolTokenFor<T>(`${mapToken}:${paramName}:${requestParamName}`);
}

export function requestParamProvider(
  mapToken: InjectionToken<ParamMap>,
  token: InjectionToken<any>,
  type: ValidatedType,
  paramName: string,
  memberMetadata: MemberMetadata,
): Provider<any> {
  return {
    provide: token,
    useFactory: requestParamValidatorFactory.bind(null, type, paramName, memberMetadata),
    deps: [mapToken, TypeValidator(type)],
  };
}

export function requestParamDecorator<T>(
  mapToken: InjectionToken<ParamMap>,
  type: ValidatedType,
  name: string,
  target: MethodTarget<T>,
  memberName: string,
  paramIndex: number,
) {
  const meta = getInjectableParamMetadata(target, memberName, paramIndex);
  const memberMetadata = getMemberMetadata(target.constructor, memberName, paramIndex);
  const token = requestParamToken<T>(mapToken, memberName, name || meta.name);
  meta.token = token;
  meta.providers = [requestParamProvider(mapToken, token, type, name || meta.name, memberMetadata)];
}
