import { InjectionToken, Provider } from '@dandi/core'

import { localOpinionatedToken } from './local-token'

export interface AppOptions {
}

export interface AppConfig {
}

export const AppConfig: InjectionToken<AppConfig> = localOpinionatedToken('AppConfig', {
  multi: false,
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function installerConfigFactory(options: AppConfig): AppConfig {
  return {
  }
}

export function appConfigProvider(options: AppOptions): Provider<AppConfig> {
  return {
    provide: AppConfig,
    useValue: installerConfigFactory(options),
  }
}
