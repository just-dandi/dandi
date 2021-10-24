import { MetadataAccessor, MethodTarget, getMetadata } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core/types'

import { globalSymbol } from '../../../src/global-symbol'

import { getParamNames } from './params-util'

const META_KEY = globalSymbol('meta:injectable')

export interface ParamMetadata<T> {
  name: string
  token?: InjectionToken<T>
  providers?: Provider<any>[]
  optional?: boolean
}

export interface InjectableMetadata {
  paramNames?: string[]
  params: Array<ParamMetadata<any>>
}

export const getInjectableMetadata: MetadataAccessor<InjectableMetadata> = getMetadata.bind(
  null,
  META_KEY,
  () => ({
    params: [] as ParamMetadata<any>[],
  }),
)

export function getInjectableParamMetadata<
  TTarget,
  TMetadata extends ParamMetadata<TTarget> = ParamMetadata<TTarget>
>(target: MethodTarget<TTarget>, propertyName: string, paramIndex: number): TMetadata {
  const targetFn = propertyName ? target[propertyName] : target.constructor
  const meta = getInjectableMetadata(targetFn)
  if (!meta.paramNames) {
    meta.paramNames = getParamNames(targetFn, propertyName)
  }
  if (!meta.params[paramIndex]) {
    meta.params[paramIndex] = {
      name: meta.paramNames[paramIndex],
    }
  }
  return meta.params[paramIndex] as TMetadata
}
