import { LogCallOptions, LogLevel } from '@dandi/core'

import {
  ConsoleLogListenerConfig,
  ConsoleLogListenerConfigProvider,
  consoleLogListenerConfigProvider,
  ConsoleLogListenerEntryInfo,
  ConsoleLogListenerFormatter,
  LogEntryTagInfo,
  TagFormatOptions,
} from './console.log-listener.config'

/**
 * @internal
 * @ignore
 */
export const DEFAULT_CONTEXT_TAG: ConsoleLogListenerFormatter = (entry: ConsoleLogListenerEntryInfo): string => entry.contextName

/**
 * @internal
 * @ignore
 */
export const DEFAULT_LEVEL_TAG: ConsoleLogListenerFormatter = (entry: ConsoleLogListenerEntryInfo): string => entry.level.toLocaleUpperCase().padEnd(entry.levelTagHighWater, ' ')

/**
 * @internal
 * @ignore
 */
export const DEFAULT_TIMESTAMP_FORMATTER: ConsoleLogListenerFormatter = (entry: ConsoleLogListenerEntryInfo): string => entry.ts ? entry.ts.toString() : undefined
const DEFAULT_TAG_PART_ORDER: (keyof LogCallOptions)[] = [
  'level',
  'timestamp',
  'context',
]

/**
 * @internal
 * @ignore
 */
export const DEFAULT_TAG_FORMATTER = (tagInfo: LogEntryTagInfo): string => {
  if (!tagInfo.partOrder.find(part => !!tagInfo[part])) {
    return undefined
  }

  let tag = ''

  if (tagInfo.tagPrefix) {
    tag += tagInfo.tagPrefix
  }

  let partAppended = false
  tagInfo.partOrder.forEach((part) => {
    if (!tagInfo[part]) {
      return
    }
    if (partAppended) {
      tag += (tagInfo.tagPartSeparator || '')
    }
    tag += tagInfo[part]
    partAppended = true
  })

  if (tagInfo.tagSuffix) {
    tag += tagInfo.tagSuffix
  }

  return tag.padEnd(tagInfo.tagHighWater, ' ')
}

const DEFAULT_TAG_FORMAT_OPTIONS: TagFormatOptions = {
  formatter: DEFAULT_TAG_FORMATTER,
  prefix: '[',
  suffix: ']',
  partSeparator: ' ',
  partOrder: DEFAULT_TAG_PART_ORDER,
}

/**
 * @internal
 * @ignore
 */
export const DEFAULT_LOGGING_CONFIG: ConsoleLogListenerConfig = {
  contextTag: false,
  levelTag: DEFAULT_LEVEL_TAG,
  timestampTag: DEFAULT_TIMESTAMP_FORMATTER,
  filter: LogLevel.debug,
  tag: DEFAULT_TAG_FORMAT_OPTIONS,
}

/**
 * A [[ConsoleLogListenerConfigProvider]] that defines basic [[LogEntry]] formatting for the console
 */
export const DefaultLogging: ConsoleLogListenerConfigProvider = consoleLogListenerConfigProvider(DEFAULT_LOGGING_CONFIG)
