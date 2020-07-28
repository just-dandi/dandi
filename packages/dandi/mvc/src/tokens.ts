import { Uuid } from '@dandi/common'

import { localToken } from './local-token'

export const HttpRequestId = localToken.opinionated<Uuid>('HttpRequestId', { multi: false })

export const RequestController = localToken.symbol<any>('RequestController')
