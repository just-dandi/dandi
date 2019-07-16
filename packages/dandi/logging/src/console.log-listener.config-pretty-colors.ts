import {
  ConsoleLogListenerConfig,
  ConsoleLogListenerConfigProvider,
  ConsoleLogListenerEntryInfo,
  ConsoleLogListenerFormatter,
  PrettyLogging,
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

export const PRETTY_COLORS_LOGGING_CONFIG: ConsoleLogListenerConfig = {
  contextTag: PRETTY_COLORS_CONTEXT_TAG,
  levelTag: PRETTY_COLORS_LEVEL_TAG,
  tag: {
    suffix: '',
    prefix: '',
  },
}

export const PrettyColorsLogging: ConsoleLogListenerConfigProvider = PrettyLogging.clone().set(PRETTY_COLORS_LOGGING_CONFIG)
