import { Constructor, getMetadata } from '@dandi/common'
import {
  Injectable,
  InjectionScope,
  InjectionToken,
  Injector,
  NotMulti,
  Provider,
  RestrictScope,
  ScopeBehavior,
  SingleInjectionToken,
} from '@dandi/core'
import { HttpRequest, HttpRequestScope } from '@dandi/http'

import { globalSymbol } from './global.symbol'
import { localToken } from './local-token'

const HTTP_REQUEST_PREPARER_META_KEY = globalSymbol('meta:HttpPipelinePreparer')
const PREPARER_RESULT_TOKENS = new Map<
  Constructor<HttpPipelinePreparer>,
  SingleInjectionToken<HttpPipelinePreparerResult>
>()

export interface HttpPipelinePreparer {
  prepare(req: HttpRequest): Promise<HttpPipelinePreparerResult>
}

export type HttpPipelinePreparerResult = Provider<any>[]

export interface HttpPipelinePreparerMetadata {
  deps: Set<Constructor<HttpPipelinePreparer>>
  dependencyResultTokens: Set<InjectionToken<HttpPipelinePreparerResult>>
}

export function getHttpPipelinePreparerMetadata(
  target: Constructor<HttpPipelinePreparer>,
): HttpPipelinePreparerMetadata {
  return getMetadata<HttpPipelinePreparerMetadata>(
    HTTP_REQUEST_PREPARER_META_KEY,
    () => ({
      dependencyResultTokens: new Set<InjectionToken<any>>(),
      deps: new Set<Constructor<HttpPipelinePreparer>>(),
    }),
    target,
  )
}

export function HttpPipelinePreparerResult(
  preparer: Constructor<HttpPipelinePreparer>,
): SingleInjectionToken<HttpPipelinePreparerResult> {
  let token: SingleInjectionToken<HttpPipelinePreparerResult> = PREPARER_RESULT_TOKENS.get(preparer)
  if (!token) {
    token = localToken.opinionated<any>(`HttpPipelinePreparerResult:${preparer.name}`, {
      multi: false,
      restrictScope: HttpRequestScope,
    })
    PREPARER_RESULT_TOKENS.set(preparer, token)
  }
  return token
}

export function httpPipelinePreparerResultProvider(
  preparer: Constructor<HttpPipelinePreparer>,
): Provider<HttpPipelinePreparerResult> {
  const meta = getHttpPipelinePreparerMetadata(preparer)
  const preparerDeps: InjectionToken<any>[] = [...meta.dependencyResultTokens]
  const defaultDeps: InjectionToken<any>[] = [Injector, HttpRequest]
  const deps: InjectionToken<any>[] = defaultDeps.concat(preparerDeps)
  const depConstructors = [...meta.deps]
  const providers = depConstructors
    .map((dep) => httpPipelinePreparerResultProvider(dep))
    .concat(depConstructors.map(httpPipelinePreparerResultProvider))
  const provide = HttpPipelinePreparerResult(preparer)
  async function httpPipelinePreparerResultProviderFactory(
    injector: Injector,
    req: HttpRequest,
    ...results: Provider<any>[][]
  ): Promise<Provider<any>[]> {
    const allDependentResults = results.reduce((result, preparerResults) => {
      result.push(...preparerResults)
      return result
    }, [])
    // TODO: this could get messy with multiple duplicate providers coming from multiple preparers... what to do then?
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const preparerScope: InjectionScope = function PreparerScope() {}
    const preparerInjector = injector.createChild(preparerScope, allDependentResults)
    const preparerInstance = (await preparerInjector.inject(preparer)) as HttpPipelinePreparer
    const preparerResults = await preparerInstance.prepare(req)
    return allDependentResults.concat(preparerResults)
  }
  return {
    provide,
    useFactory: httpPipelinePreparerResultProviderFactory,
    async: true,
    deps,
    providers,
    restrictScope: HttpRequestScope,
  }
}

function httpPipelinePreparerDecorator(
  deps: Constructor<HttpPipelinePreparer>[],
  depResultTokens: InjectionToken<any>[],
  target: Constructor<HttpPipelinePreparer>,
): void {
  // note: must use ScopeBehavior.perInjector() to ensure that instances have access to the dynamically generated providers
  // from httpPipelinePreparerResultProvider
  Injectable(target, NotMulti, RestrictScope(ScopeBehavior.perInjector(HttpRequestScope)))(target)
  const meta = getHttpPipelinePreparerMetadata(target)
  deps.forEach((dep) => meta.deps.add(dep))
  depResultTokens.forEach((token) => meta.dependencyResultTokens.add(token))
}

export function HttpPipelinePreparer(...deps: Constructor<HttpPipelinePreparer>[]): ClassDecorator {
  const depResultTokens = deps.map((dep) => HttpPipelinePreparerResult(dep))
  return httpPipelinePreparerDecorator.bind(null, deps, depResultTokens)
}
