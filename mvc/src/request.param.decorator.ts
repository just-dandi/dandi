import { isConstructor } from '@dandi/common';
import { getInjectableParamMetadata, InjectionToken, MethodTarget, ParamMetadata, Provider } from '@dandi/core';
import { getMemberMetadata, MemberMetadata } from '@dandi/model';
import { ModelValidator, ValidatedType } from '@dandi/model-validation';

import { ConditionDecorators } from './condition.decorator';
import { conditionWithinByKeyDecorator } from './condition.within';
import { localSymbolTokenFor } from './local.token';
import { requestParamValidatorFactory } from './request.param.validator';
import { ParamMap } from './tokens';

export interface RequestParamDecorator<T> extends ParameterDecorator, ConditionDecorators {
  (target: Object, propertyKey: string | symbol, parameterIndex: number): {
    meta: ParamMetadata<T>;
    memberMetadata: MemberMetadata;
  };
}

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
    deps: [mapToken, ModelValidator],
  };
}

export function makeRequestParamDecorator<T>(
  mapToken: InjectionToken<ParamMap>,
  type: ValidatedType,
  name: string,
): RequestParamDecorator<T> {
  const apply: ParameterDecorator & RequestParamDecorator<T> = function(
    target: MethodTarget<any>,
    memberName: string,
    paramIndex: number,
  ) {
    const meta = getInjectableParamMetadata(target, memberName, paramIndex);
    const memberMetadata = getMemberMetadata(target.constructor, memberName, paramIndex);
    const token = requestParamToken<T>(mapToken, memberName, name || meta.name);
    if (isConstructor(type)) {
      memberMetadata.type = type;
    }
    meta.token = token;
    meta.providers = [requestParamProvider(mapToken, token, type, name || meta.name, memberMetadata)];

    return {
      meta,
      memberMetadata,
    };
  } as any;
  apply.within = conditionWithinByKeyDecorator.bind(null, apply);
  return apply;
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
  if (isConstructor(type)) {
    memberMetadata.type = type;
  }
  meta.token = token;
  meta.providers = [requestParamProvider(mapToken, token, type, name || meta.name, memberMetadata)];
}
