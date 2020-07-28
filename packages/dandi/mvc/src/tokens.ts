import { Uuid } from '@dandi/common'
import { InjectionToken } from '@dandi/core'

import { localToken } from './local-token'

export const HttpRequestId: InjectionToken<Uuid> = localToken.opinionated<Uuid>('HttpRequestId', { multi: false })

export const RequestController: InjectionToken<any> = localToken.symbol<any>('RequestController')
