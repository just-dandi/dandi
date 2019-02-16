import {
  DefaultLogging,
  DEFAULT_CONTEXT_TAG,
  DEFAULT_LEVEL_TAG,
} from './console.log-listener.config-default'

import { ConsoleLogListenerConfig } from './console.log-listener.config'

export const PrettyLogging: ConsoleLogListenerConfig = Object.assign({}, DefaultLogging, {
  contextTag: DEFAULT_CONTEXT_TAG,
  levelTag: DEFAULT_LEVEL_TAG,
  timestampTag: 'yyyy/MM/dd hh:mm:ss.u a',
})
