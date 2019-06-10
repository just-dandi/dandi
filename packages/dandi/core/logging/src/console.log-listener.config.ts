import { cloneObject } from '@dandi/common'
import { LogCallOptions, LogEntry, LogLevel, ValueProvider } from '@dandi/core'
import { DateTimeFormatOptions } from 'luxon'

import { localOpinionatedToken } from './local-token'

/**
 * Additional metadata used for displaying a {@see LogEntry} in the console.
 */
export interface ConsoleLogListenerEntryInfo extends LogEntry {
  levelTagHighWater: number
  tagHighWater: number
  contextName: string
}

/**
 * A function that takes a {@see ConsoleLogListenerEntryInfo} object and returns a `string`.
 */
export type ConsoleLogListenerFormatter = (entryInfo: ConsoleLogListenerEntryInfo) => string

/**
 * A function that generates a string or array of strings representing the "message" portion of a {@see LogEntry}.
 */
export type ConsoleLogListenerMessageFormatter = (entryInfo: ConsoleLogListenerEntryInfo) => string | string[]

/**
 * An object containing formatted sections of a {@see LogEntry} tag, as well as metadata and configuration data
 */
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

/**
 * Defines configuration options for formatting the tag portion of a {@see LogEntry}
 */
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
  levelOptions?: { [TKey in keyof LogLevel]?: ConsoleLogListenerOptions }
  filter?: LogLevel
}

export const ConsoleLogListenerConfig = localOpinionatedToken('ConsoleLogListenerConfig', {
  multi: false,
})

export function consoleLogListenerConfigProvider(config: ConsoleLogListenerConfig): ConsoleLogListenerConfigProvider {
  return new ConsoleLogListenerConfigProvider(config)
}

/**
 * A helper class for creating {@see ConsoleLogListenerConfig} objects.
 */
export class ConsoleLogListenerConfigProvider implements ValueProvider<ConsoleLogListenerConfig> {

  private readonly config: ConsoleLogListenerConfig

  public readonly provide = ConsoleLogListenerConfig

  public get useValue(): ConsoleLogListenerConfig {
    return this.config
  }

  constructor(config: ConsoleLogListenerConfig) {
    this.config = cloneObject(config)
  }

  public set(config: ConsoleLogListenerConfig): this {
    Object.assign(this.config, config)
    return this
  }

  public clone(): ConsoleLogListenerConfigProvider {
    return new ConsoleLogListenerConfigProvider(this.config)
  }

}
