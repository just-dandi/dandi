import { Constructor } from '@dandi/common'

import { InjectionToken } from './injection-token'
import { localOpinionatedToken, localSymbolToken } from './local-token'
import { MultiProvider, Provider } from './provider'

export interface ScannerContructor {
  new (config: any[]): Scanner;
}

/**
 * A service that discovered [[Provider]] objects
 */
export interface Scanner {
  scan(): Promise<Array<Provider<any> | Constructor<any>>>
}

export const Scanner: InjectionToken<Scanner> = localOpinionatedToken<Scanner>('Scanner', { multi: true })
export const ScannerConfig: InjectionToken<any[]> = localSymbolToken<any[]>('ScannerConfig')

/**
 * Creates a [[Provider]] object for the specified [[Scanner]] implementation
 * @param scanner
 * @param config
 */
export function scannerProvider<T extends Scanner>(
  scanner: Constructor<Scanner>,
  config: any[],
): MultiProvider<Scanner> {
  return {
    provide: Scanner,
    useClass: scanner,
    multi: true,
    providers: [
      {
        provide: ScannerConfig,
        useValue: config,
      },
    ],
  }
}
