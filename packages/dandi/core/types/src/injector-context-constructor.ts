import { localToken } from '../../src/local-token'

import { InjectorContext } from './injector-context'

export interface InjectorContextConstructor {
  new (...args: any[]): InjectorContext
}

export const InjectorContextConstructor = localToken.opinionated<InjectorContextConstructor>(
  'InjectorContextConstructor',
  {
    multi: false,
  },
)
