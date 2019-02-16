import { AmbientInjectableScanner, Container } from '@dandi/core'
import { ConsoleLogListener, consoleLogListenerConfigProvider, LoggingModule } from '@dandi/core/logging'
import { PrettyColorsLogging } from '@dandi/core-node/logging'

import { App } from './app'
import { appConfigProvider } from './app-options'

export function run(startTs: number, options: any): Promise<void> {
  const container = new Container({
    providers: [
      AmbientInjectableScanner,
      LoggingModule.use(ConsoleLogListener),
      consoleLogListenerConfigProvider(PrettyColorsLogging),

      appConfigProvider(options),

      App,
    ],
  })

  return container.start(startTs)

}
