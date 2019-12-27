import { isConstructor } from '@dandi/common'
import { getInjectableParamMetadata, isInjectionToken, methodTarget } from '@dandi/core/internal/util'
import { InjectionToken, InjectionTokenTypeError } from '@dandi/core/types'

export function Inject<T>(token: InjectionToken<T>): ParameterDecorator {
  return function injectDecorator<T>(target: any, paramName: string, paramIndex: number): void {
    if (!isInjectionToken(token)) {
      throw new InjectionTokenTypeError(token)
    }
    const injectTarget = isConstructor(target) ? methodTarget(target) : target
    const meta = getInjectableParamMetadata(injectTarget, paramName, paramIndex)
    meta.token = token
  }
}
