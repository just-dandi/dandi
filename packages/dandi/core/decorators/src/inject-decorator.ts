import { isConstructor, methodTarget } from '@dandi/common'
import { getInjectableParamMetadata, isInjectionToken } from '@dandi/core/internal/util'
import { InjectionToken, InjectionTokenTypeError } from '@dandi/core/types'

export function Inject(token: InjectionToken): ParameterDecorator {
  return function injectDecorator(target: any, paramName: string, paramIndex: number): void {
    if (!isInjectionToken(token)) {
      throw new InjectionTokenTypeError(token)
    }
    const injectTarget = isConstructor(target) ? methodTarget(target) : target
    const meta = getInjectableParamMetadata(injectTarget, paramName, paramIndex)
    meta.token = token
  }
}
