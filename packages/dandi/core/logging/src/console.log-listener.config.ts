import { LogCallOptions, LogLevel, Provider } from '@dandi/core'
import { DateTimeFormatOptions } from 'luxon'

import { localOpinionatedToken } from './local.token'
import { LogEntry } from './log-entry'

export interface ConsoleLogListenerEntryInfo extends LogEntry {
  levelTagHighWater: number
  tagHighWater: number
  contextName: string
}
export type ConsoleLogListenerFormatter = (entryInfo: ConsoleLogListenerEntryInfo) => string
export type ConsoleLogListenerMessageFormatter = (entryInfo: ConsoleLogListenerEntryInfo) => string | string[]

export interface LogEntryTagInfo {
  partOrder: (keyof LogCallOptions)[]
  context: string
  level: string
  levelTagHighWater: number
  timestamp: string
  tagPartSeparator: string
  tagPrefix: string
  tagSuffix: string
  tagHighWater: number
}

export interface TagFormatOptions {
  partSeparator?: string
  partOrder?: (keyof LogCallOptions)[]
  prefix?: string
  suffix?: string
  formatter?: ConsoleLogListenerTagFormatter
}

export type ConsoleLogListenerTagFormatter = (tagInfo: LogEntryTagInfo) => string

export interface ConsoleLogListenerOptions {
  levelTag?: boolean | ConsoleLogListenerFormatter
  contextTag?: boolean | ConsoleLogListenerFormatter
  timestampTag?: boolean | string | ConsoleLogListenerFormatter | DateTimeFormatOptions
  messageFormatter?: ConsoleLogListenerMessageFormatter
  tag?: boolean | ConsoleLogListenerTagFormatter | TagFormatOptions
}

export interface ConsoleLogListenerConfig extends ConsoleLogListenerOptions {
  levelOptions?: { [key in keyof LogLevel]?: ConsoleLogListenerOptions }
  filter?: LogLevel
}

export const ConsoleLogListenerConfig = localOpinionatedToken('ConsoleLogListenerConfig', {
  multi: false,
})

export function consoleLogListenerConfigProvider(config: ConsoleLogListenerConfig): Provider<ConsoleLogListenerConfig> {
  return {
    provide: ConsoleLogListenerConfig,
    useValue: config,
  }
}
