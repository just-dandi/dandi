import { DandiApplication } from '@dandi/core'
import { ConsoleLogListener, LoggingModule } from '@dandi/core/logging'
import { PrettyColorsLogging } from '@dandi/logging'

import { SimpleConsoleApp } from './app'
import { appConfigProvider } from './app-options'

export function run(startTs: number, options: any): Promise<void> {
  const app = new DandiApplication({
    providers: [
      LoggingModule.use(ConsoleLogListener, PrettyColorsLogging),

      appConfigProvider(options),

      SimpleConsoleApp,
    ],
  })

  return app.run(startTs)
}
