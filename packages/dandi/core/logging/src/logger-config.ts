import { LogStream, OnConfig, Provider } from '@dandi/core'
import { OnConfigInternal } from '@dandi/core/internal'

import { LogListener } from './log-listener'

function loggerConfigFactory(stream: LogStream, listeners: LogListener[]): (() => void) {
  return () => (listeners || []).forEach(listener => stream.subscribe(entry => listener.log(entry)))
}

export const LoggerConfig: Provider<OnConfig> = {
  provide: OnConfigInternal,
  useFactory: loggerConfigFactory,
  deps: [LogStream, LogListener],
}
