import { Provider } from '@dandi/core'
import { Express } from 'express'
import * as express from 'express'

import { localToken } from './local-token'

export const ExpressInstance = localToken.opinionated<Express>('Express', {
  multi: false,
})

export const ExpressInstanceProvider: Provider<Express> = {
  provide: ExpressInstance,
  useFactory: express,
}
