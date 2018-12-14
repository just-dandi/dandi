import { OnConfig, Provider } from '@dandi/core'

import { OnConfigInternal } from '../../src/on-config-internal'

import { LogListener } from './log-listener'
import { LogStream } from './log-stream'

export const LoggerConfig: Provider<OnConfig> = {
  provide: OnConfigInternal,
  useFactory: (stream: LogStream, listeners: LogListener[]): OnConfig => (): void => {
    (listeners || []).forEach(listener => stream.subscribe(entry => listener.log(entry)))
  },
  deps: [LogStream, LogListener],
}
