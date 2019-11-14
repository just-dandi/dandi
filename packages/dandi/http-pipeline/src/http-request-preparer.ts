import { Constructor } from '@dandi/common'
import { InjectionToken, Injector, Provider } from '@dandi/core'
import { HttpRequest } from '@dandi/http'

import { localOpinionatedToken } from './local-token'

/**
 * httpRequestPreparer(FooPreparer)
 *   .dependsOn(AuthPreparer)
 */
export interface HttpRequestPreparer {
  prepare(req: HttpRequest): Promise<Provider<any>[]>
}

const PREPARER_RESULT_TOKENS = new Map<Constructor<HttpRequestPreparer>, InjectionToken<any>>()
export function HttpRequestPreparerResult(preparer: Constructor<HttpRequestPreparer>): InjectionToken<any> {
  let token: InjectionToken<HttpRequestPreparer> = PREPARER_RESULT_TOKENS.get(preparer)
  if (!token) {
    token = localOpinionatedToken<any>(`HttpRequestPreparerResult#${preparer.name}`, {
      multi: false,
    })
    PREPARER_RESULT_TOKENS.set(preparer, token)
  }
  return token
}

// FIXME: use a class decorator to define hard dependencies instead - specify deps on the class in decorator arguments
//        convert this to be used for order preference
export class HttpRequestPreparerFactory {

  private readonly deps: Constructor<HttpRequestPreparer>[] = []

  constructor(public readonly target: Constructor<HttpRequestPreparer>) {
  }

  public dependsOn(...preparers: Constructor<HttpRequestPreparer>[]): HttpRequestPreparerFactory {
    this.deps.push(...preparers)
    return this
  }

  public createProvider(): Provider<any> {
    const deps: InjectionToken<any>[] = [Injector, HttpRequest]
      .concat(this.deps.map(dep => HttpRequestPreparerResult(dep)))
    return {
      provide: HttpRequestPreparerResult(this.target),
      useFactory: async (injector: Injector, req: HttpRequest): Promise<Provider<any>[]> => {
        const preparer: HttpRequestPreparer = (await injector.inject(this.target)).singleValue
        return preparer.prepare(req)
      },
      async: true,
      deps,
    }
  }
}
