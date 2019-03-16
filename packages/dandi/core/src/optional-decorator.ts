import { isConstructor } from '@dandi/common'

import { getInjectableParamMetadata, methodTarget } from './injectable-metadata'

/**
 * @internal
 * @ignore
 */
export function optionalDecorator(target: any, propertyName: string, paramIndex: number): void {
  const paramTarget = isConstructor(target) ? methodTarget(target) : target
  const meta = getInjectableParamMetadata(paramTarget, propertyName, paramIndex)
  meta.optional = true
}

/**
 * Marks the decorated parameter as optional. This prevents [[Resolver.resolve]] from throwing [[MissingProviderError]],
 * and causes the parameter to be injected with `undefined` if there is no matching [[Provider]].
 * @decorator
 */
export function Optional(): ParameterDecorator {
  return optionalDecorator
}
