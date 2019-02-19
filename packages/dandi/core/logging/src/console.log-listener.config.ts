import { cloneObject } from '@dandi/common'
import { LogCallOptions, LogLevel, ValueProvider } from '@dandi/core'
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

export function consoleLogListenerConfigProvider(config: ConsoleLogListenerConfig): ConsoleLogListenerConfigProvider {
  return new ConsoleLogListenerConfigProvider(config)
}

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
