import {
  ConsoleLogListenerConfig,
  ConsoleLogListenerEntryInfo,
  ConsoleLogListenerFormatter,
  PrettyLogging,
} from '@dandi/core/logging'
import { DateTime } from 'luxon'

import { ColorsNotLoadedError } from './colors-not-loaded-error'

import * as colors from './colors'

let initColors = function() {
  colors.setTheme({
    debug: 'cyan',
    info: 'grey',
    warn: 'yellow',
    error: 'red',
  })
  initColors = () => {}
}

function checkColors() {
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

export const PrettyColorsLogging: ConsoleLogListenerConfig = Object.assign({}, PrettyLogging, {
  contextTag: PRETTY_COLORS_CONTEXT_TAG,
  levelTag: PRETTY_COLORS_LEVEL_TAG,
  tag: {
    suffix: '',
    prefix: '',
  },
})
