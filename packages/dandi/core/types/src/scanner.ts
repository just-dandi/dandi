import { Constructor } from '@dandi/common'

import { localToken } from '../../src/local-token'

import { InjectionToken } from './injection-token'
import { MultiProvider, Provider } from './provider'
import { Registerable } from './registerable'

export interface Scanner {
  scan(): Promise<Registerable[]>
}

export const Scanner: InjectionToken<Scanner> = localToken.opinionated<Scanner>('Scanner', { multi: true })

export function scannerProvider<T extends Scanner>(
  scanner: Constructor<Scanner>,
  ...providers: Provider<any>[]
): MultiProvider<Scanner> {
  return {
    provide: Scanner,
    useClass: scanner,
    multi: true,
    providers,
  }
}
