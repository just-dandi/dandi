import { Constructor, MetadataAccessor, MethodTarget, getMetadata } from '@dandi/common'

import { globalSymbol } from './global-symbol'
import { InjectionToken } from './injection-token'
import { getParamNames } from './params-util'
import { Provider } from './provider'

const META_KEY = globalSymbol('meta:injectable')

/**
 * @internal
 * @ignore
 */
export function methodTarget<T>(target: Constructor<T>): MethodTarget<T> {
  return target.prototype as MethodTarget<T>
}

/**
 * @internal
 * @ignore
 */
export interface ParamMetadata<T> {
  name: string
  token?: InjectionToken<T>
  providers?: Array<Provider<any>>
  optional?: boolean
}

/**
 * @internal
 * @ignore
 */
export interface InjectableMetadata {
  paramNames?: string[]
  params: Array<ParamMetadata<any>>
}

/**
 * @internal
 * @ignore
 */
export const getInjectableMetadata: MetadataAccessor<InjectableMetadata> = getMetadata.bind(null, META_KEY, () => ({
  params: [] as Array<ParamMetadata<any>>,
}))

/**
 * @internal
 * @ignore
 */
export function getInjectableParamMetadata<TTarget, TMetadata extends ParamMetadata<TTarget> = ParamMetadata<TTarget>>(
  target: MethodTarget<TTarget>,
  propertyName: string,
  paramIndex: number,
): TMetadata {
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
