import { ConsoleLogListenerConfig, ConsoleLogListenerConfigProvider } from './console-log-listener-config'
import { DEFAULT_CONTEXT_TAG, DEFAULT_LEVEL_TAG, DefaultLogging } from './console-log-listener-config-default'

export const PRETTY_LOGGING_CONFIG: ConsoleLogListenerConfig = {
  contextTag: DEFAULT_CONTEXT_TAG,
  levelTag: DEFAULT_LEVEL_TAG,
  timestampTag: 'yyyy/MM/dd hh:mm:ss.u a',
}

export const PrettyLogging: ConsoleLogListenerConfigProvider = DefaultLogging.clone().set(PRETTY_LOGGING_CONFIG)
