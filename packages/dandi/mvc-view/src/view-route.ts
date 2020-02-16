import { Route } from '@dandi/mvc'

import { ViewMetadata } from './view-metadata'

export interface ViewRoute extends Route {
  view: ViewMetadata
}
