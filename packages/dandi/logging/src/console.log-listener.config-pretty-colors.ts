import { Provider } from '@dandi/core'
import {
  ConsoleLogListenerConfig,
  consoleLogListenerConfigProvider,
  ConsoleLogListenerEntryInfo,
  ConsoleLogListenerFormatter,
  PRETTY_LOGGING_CONFIG,
} from '@dandi/core/logging'

import { ColorsNotLoadedError } from './colors-not-loaded-error'

import * as colors from './colors'

export function initColors(): void {
  if (!colors['debug']) {
    colors.setTheme({
      debug: 'cyan',
      info: 'grey',
      warn: 'yellow',
      error: 'red',
    })
  }
}

function checkColors(): void {
  if (!colors.__loaded) {
    throw new ColorsNotLoadedError()
  }
  initColors()
}

export const PRETTY_COLORS_CONTEXT_TAG: ConsoleLogListenerFormatter = (entry: ConsoleLogListenerEntryInfo): string => {
  checkColors()
  return `(${colors[entry.level](entry.contextName)})`
}

export const PRETTY_COLORS_LEVEL_TAG: ConsoleLogListenerFormatter = (entry: ConsoleLogListenerEntryInfo): string => {
  checkColors()
  return `[${colors[entry.level](entry.level.toLocaleUpperCase())}]`.padEnd(entry.levelTagHighWater, ' ')
}

export const PRETTY_COLORS_LOGGING_CONFIG: ConsoleLogListenerConfig = Object.assign({}, PRETTY_LOGGING_CONFIG, {
  contextTag: PRETTY_COLORS_CONTEXT_TAG,
  levelTag: PRETTY_COLORS_LEVEL_TAG,
  tag: {
    suffix: '',
    prefix: '',
  },
})

export const PrettyColorsLogging: Provider<ConsoleLogListenerConfig> = consoleLogListenerConfigProvider(PRETTY_COLORS_LOGGING_CONFIG)
