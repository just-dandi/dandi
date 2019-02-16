import { InjectionToken, Provider } from '@dandi/core'

import { localOpinionatedToken } from './local-token'

export interface AppOptions {
}

export interface AppConfig {
}
// tslint:disable-next-line variable-name
export const AppConfig: InjectionToken<AppConfig> = localOpinionatedToken('AppConfig', {
  multi: false,
  singleton: true,
})

export function installerConfigFactory(options: AppConfig): AppConfig {
  return {
  }
}

// tslint:disable-next-line variable-name
export function appConfigProvider(options: AppOptions): Provider<AppConfig> {
  return {
    provide: AppConfig,
    useValue: installerConfigFactory(options),
  }
}
