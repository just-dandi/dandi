import { ProviderOptions } from '@dandi/core'
import { RouteTransformer } from '@dandi/mvc'
import { ControllerViewMethodMetadata, ViewRoute, ViewRouteTransformer } from '@dandi/mvc-view'

import { expect } from 'chai'

describe('ViewRouteTransformer', () => {

  let transformer: ViewRouteTransformer

  beforeEach(() => {
    transformer = new ViewRouteTransformer()
  })
  afterEach(() => {
    transformer = undefined
  })

  it('is decorated with @Injectable(RouteTransformer)', () => {
    expect(Reflect.get(ViewRouteTransformer, ProviderOptions.valueOf() as symbol).provide).to.equal(RouteTransformer)
  })

  it('adds view metadata if the provided controller method metadata has it', () => {
    const views = [{ name: 'test' }]
    const methodMeta = { views } as ControllerViewMethodMetadata
    const route = {} as ViewRoute
    const result = transformer.transform(route, {}, methodMeta) as ViewRoute
    expect(result).to.equal(route)
    expect(result.views).to.deep.equal(views)
  })

  it('does not add a view property to the route if there is no view metadata on the controller method metadata', () => {
    const route = {} as ViewRoute
    const result = transformer.transform(route, {}, {}) as ViewRoute
    expect(result).to.equal(route)
    expect(result.views).not.to.exist
  })
})
