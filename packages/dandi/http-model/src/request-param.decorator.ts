import { MethodTarget, isConstructor } from '@dandi/common'
import { InjectionToken, Provider, SyncFactoryProvider } from '@dandi/core'
import { getInjectableParamMetadata, ParamMetadata } from '@dandi/core/internal/util'
import { ParamMap } from '@dandi/http'
import { MemberMetadata, getMemberMetadata } from '@dandi/model'
import { ConvertedType, MetadataModelValidator, ModelBuilder, ModelBuilderOptions } from '@dandi/model-builder'

import { ConditionDecorators } from './condition'
import { localSymbolTokenFor, localOpinionatedToken } from './local-token'
import { requestParamValidatorFactory } from './request-param-validator'

export interface RequestParamDecorator<T> extends ParameterDecorator, ConditionDecorators {
  (target: Object, propertyKey: string | symbol, parameterIndex: number): {
    meta: ParamMetadata<T>
    memberMetadata: MemberMetadata
  }
}

export function requestParamToken<T>(
  mapToken: InjectionToken<ParamMap>,
  paramName: string,
  requestParamName: string,
): InjectionToken<T> {
  return localSymbolTokenFor<T>(`${mapToken}:${paramName}:${requestParamName}`)
}

export const RequestParamModelBuilderOptions: InjectionToken<ModelBuilderOptions> = localOpinionatedToken(
  'RequestParamModelBuilderOptions',
  {
    multi: false,
  },
)

export const RequestParamModelBuilderOptionsProvider: SyncFactoryProvider<ModelBuilderOptions> = {
  provide: RequestParamModelBuilderOptions,
  useFactory: () => ({
    validators: [new MetadataModelValidator()],
  }),
}

export function requestParamProvider(
  mapToken: InjectionToken<ParamMap>,
  token: InjectionToken<any>,
  type: ConvertedType,
  paramName: string,
  paramMeta: ParamMetadata<any>,
  memberMetadata: MemberMetadata,
): Provider<any> {
  return {
    provide: token,
    useFactory: requestParamValidatorFactory.bind(undefined, type, paramName, paramMeta, memberMetadata),
    deps: [mapToken, ModelBuilder, RequestParamModelBuilderOptions],
    providers: [RequestParamModelBuilderOptionsProvider],
  }
}

export function makeRequestParamDecorator<T>(
  mapToken: InjectionToken<ParamMap>,
  type: ConvertedType,
  name: string,
  optional: boolean,
): RequestParamDecorator<T> {
  const apply: ParameterDecorator & RequestParamDecorator<T> = function (
    target: MethodTarget<any>,
    memberName: string,
    paramIndex: number,
  ) {
    const meta = getInjectableParamMetadata(target, memberName, paramIndex)
    const memberMetadata = getMemberMetadata(target.constructor, memberName, paramIndex)
    const token = requestParamToken<T>(mapToken, memberName, name || meta.name)
    if (isConstructor(type)) {
      memberMetadata.type = type
    }
    meta.token = token
    meta.optional = optional
    meta.providers = [requestParamProvider(mapToken, token, type, name || meta.name, meta, memberMetadata)]

    return {
      meta,
      memberMetadata,
    }
  } as any
  // FIXME: figure out how to do this without introducing authorization logic to @dandi/http*?
  //        OR: figure out how to abstract authorization away from @dandi/mvc
  // apply.within = conditionWithinByKeyDecorator.bind(null, apply)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  apply.within = () => () => {}
  return apply
}
