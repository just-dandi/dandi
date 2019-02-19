import { Provider } from '@dandi/core'

import { ConsoleLogListenerConfig, consoleLogListenerConfigProvider } from './console.log-listener.config'
import { DEFAULT_CONTEXT_TAG, DEFAULT_LEVEL_TAG, DEFAULT_LOGGING_CONFIG } from './console.log-listener.config-default'

export const PRETTY_LOGGING_CONFIG: ConsoleLogListenerConfig = Object.assign({}, DEFAULT_LOGGING_CONFIG, {
  contextTag: DEFAULT_CONTEXT_TAG,
  levelTag: DEFAULT_LEVEL_TAG,
  timestampTag: 'yyyy/MM/dd hh:mm:ss.u a',
})

export const PrettyLogging: Provider<ConsoleLogListenerConfig> = consoleLogListenerConfigProvider(PRETTY_LOGGING_CONFIG)
