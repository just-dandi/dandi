import { ProviderOptions } from '@dandi/core/types'

import { globalSymbol } from '../../../src/global-symbol'

export interface InjectableRegistrationData {
  target: any
  providerOptions: ProviderOptions<any>
}

export const InjectableRegistrationData = globalSymbol('InjectableRegistrationData')

export const INJECTABLE_REGISTRATION_DATA: InjectableRegistrationData[] = []
