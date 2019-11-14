import { Uuid } from '@dandi/common'
import { InjectionToken } from '@dandi/core'

import { localOpinionatedToken, localSymbolToken } from './local.token'

export const HttpRequestId: InjectionToken<Uuid> = localOpinionatedToken<Uuid>('HttpRequestId', { multi: false })

export const RequestController: InjectionToken<any> = localSymbolToken<any>('RequestController')
