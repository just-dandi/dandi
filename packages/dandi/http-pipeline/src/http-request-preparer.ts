import { Constructor, getMetadata } from '@dandi/common'
import { injectableDecorator, InjectionToken, NotMulti, Provider } from '@dandi/core'
import { Injector } from '@dandi/core/src/injector'
import { HttpRequest } from '@dandi/http'

import { globalSymbol } from './global.symbol'
import { localOpinionatedToken } from './local-token'

const HTTP_REQUEST_PREPARER_META_KEY = globalSymbol('meta:httpRequestPreparer')
const PREPARER_RESULT_TOKENS = new Map<Constructor<HttpRequestPreparer>, InjectionToken<HttpRequestPreparerResult>>()

export interface HttpRequestPreparer {
  prepare(req: HttpRequest): Promise<HttpRequestPreparerResult>
}

export type HttpRequestPreparerResult = Provider<any>[]

export interface HttpRequestPreparerMetadata {
  deps: Set<Constructor<HttpRequestPreparer>>,
  dependencyResultTokens: Set<InjectionToken<HttpRequestPreparerResult>>
}

export function getHttpRequestPreparerMetadata(target: Constructor<HttpRequestPreparer>): HttpRequestPreparerMetadata {
  return getMetadata<HttpRequestPreparerMetadata>(
    HTTP_REQUEST_PREPARER_META_KEY,
    () => ({ dependencyResultTokens: new Set<InjectionToken<any>>(), deps: new Set<Constructor<HttpRequestPreparer>>() }),
    target,
  )
}

export function HttpRequestPreparerResult(preparer: Constructor<HttpRequestPreparer>): InjectionToken<HttpRequestPreparerResult> {
  let token: InjectionToken<HttpRequestPreparerResult> = PREPARER_RESULT_TOKENS.get(preparer)
  if (!token) {
    token = localOpinionatedToken<any>(`HttpRequestPreparerResult#${preparer.name}`, {
      multi: false,
      singleton: true,
    })
    PREPARER_RESULT_TOKENS.set(preparer, token)
  }
  return token
}

export function httpRequestPreparerResultProvider(preparer: Constructor<HttpRequestPreparer>): Provider<HttpRequestPreparerResult> {
  const meta = getHttpRequestPreparerMetadata(preparer)
  const preparerDeps: InjectionToken<any>[] = [...meta.dependencyResultTokens]
  const deps = [Injector, HttpRequest].concat(preparerDeps)
  const depConstructors = [...meta.deps]
  const providers = depConstructors
    .map(dep => httpRequestPreparerResultProvider(dep))
    .concat(depConstructors.map(httpRequestPreparerResultProvider))
  return {
    provide: HttpRequestPreparerResult(preparer),
    useFactory: async (injector: Injector, req: HttpRequest, ...results: Provider<any>[][]): Promise<Provider<any>[]> => {
      const allDependentResults = results.reduce((result, preparerResults) => {
        result.push(...preparerResults)
        return result
      }, [])
      // TODO: this could get messy with multiple duplicate providers coming from multiple preparers... what to do then?
      const preparerInstance = (await injector.inject(preparer, false, ...allDependentResults)).singleValue
      const preparerResults = await preparerInstance.prepare(req)
      return allDependentResults.concat(preparerResults)
    },
    async: true,
    deps,
    providers,
  }
}

function httpRequestPreparerDecorator(
  deps: Constructor<HttpRequestPreparer>[],
  depResultTokens: InjectionToken<any>[],
  target: Constructor<HttpRequestPreparer>,
): void {
  injectableDecorator(target, [NotMulti], target)
  const meta = getHttpRequestPreparerMetadata(target)
  deps.forEach(dep => meta.deps.add(dep))
  depResultTokens.forEach(token => meta.dependencyResultTokens.add(token))
}

export function HttpRequestPreparer(...deps: Constructor<HttpRequestPreparer>[]): ClassDecorator {
  const depResultTokens = deps.map(dep => HttpRequestPreparerResult(dep))
  return httpRequestPreparerDecorator.bind(null, deps, depResultTokens)
}
