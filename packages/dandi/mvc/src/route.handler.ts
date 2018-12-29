import { InjectionToken } from '@dandi/core'

import { localSymbolToken } from './local.token'

export interface RouteHandler {
  handleRouteRequest(...args: any[]): Promise<void>;
}

export const RouteHandler: InjectionToken<RouteHandler> = localSymbolToken<RouteHandler>('RouteHandler')
