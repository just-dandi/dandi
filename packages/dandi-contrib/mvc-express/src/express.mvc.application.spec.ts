import { Repository } from '@dandi/core'
import { RouteGenerator, RouteInitializer } from '@dandi/mvc'
import { stub } from 'sinon'

import { ExpressInstance, ExpressMvcConfig } from '../'

const TEST_EXPRESS_RESOLVER: any = {
  provide: ExpressInstance,
  useValue: {
    use() {},
    listen() {},
  },
}

const REGISTRATION_SOURCE = {
  constructor: function ExpressMvcApplicationSpec() {},
}

Repository.global.register(REGISTRATION_SOURCE, TEST_EXPRESS_RESOLVER)
Repository.global.register(REGISTRATION_SOURCE, {
  provide: ExpressMvcConfig,
  useValue: {},
})
Repository.global.register(REGISTRATION_SOURCE, {
  provide: RouteGenerator,
  useValue: {
    generateRoutes: stub().returns([]),
  },
})
Repository.global.register(REGISTRATION_SOURCE, {
  provide: RouteInitializer,
  useValue: {},
})
