import {
  getInjectionContextName,
  Inject,
  Injectable,
  InjectionContext,
  LogEntry,
  LogLevel,
  Optional,
  Singleton,
} from '@dandi/core'
import { DateTime, DateTimeFormatOptions } from 'luxon'

import {
  ConsoleLogListenerConfig,
  ConsoleLogListenerEntryInfo,
  ConsoleLogListenerOptions,
  LogEntryTagInfo, TagFormatOptions,
} from './console.log-listener.config'
import { LogLevelFilter, LogLevelValue } from './log-level-filter'
import { LogListener } from './log-listener'
import {
  DEFAULT_CONTEXT_TAG,
  DEFAULT_LEVEL_TAG,
  DEFAULT_LOGGING_CONFIG,
  DEFAULT_TIMESTAMP_FORMATTER,
} from './console.log-listener.config-default'

const LUXON_TIMESTAMP_FORMATTER = (entry: ConsoleLogListenerEntryInfo, format: string): string => entry.ts ? DateTime.fromMillis(entry.ts).toFormat(format) : undefined
const LOCALE_TIMESTAMP_FORMATTER = (entry: ConsoleLogListenerEntryInfo, options: DateTimeFormatOptions): string => entry.ts ? DateTime.fromMillis(entry.ts).toLocaleString(options) : undefined

const DEFAULT_CONFIG = DEFAULT_LOGGING_CONFIG
const DEFAULT_TAG_FORMAT_OPTIONS: TagFormatOptions = DEFAULT_CONFIG.tag as TagFormatOptions

function coalesceByDefined<T>(a: T, b: T): T {
  return typeof a === 'undefined' ? b : a
}

@Injectable(LogListener, Singleton)
export class ConsoleLogListener implements LogListener {

  private tagLengthHighWater = 0;
  private readonly longestAllowedLevelTag: number;

  constructor(@Inject(ConsoleLogListenerConfig) @Optional() private config: ConsoleLogListenerConfig = DEFAULT_CONFIG) {
    this.longestAllowedLevelTag = this.getLongestAllowedLevelTag()
  }

  public log(entry: LogEntry): void {

    if (this.isFiltered(entry.level)) {
      return
    }

    const modifiersDisabled = entry.options &&
      entry.options.context === false &&
      entry.options.level === false &&
      entry.options.timestamp === false
    if (this.tagDisabled(this.config.tag, modifiersDisabled ? false : undefined)) {
      return console[entry.level](...entry.args)
    }

    const entryInfo: ConsoleLogListenerEntryInfo = Object.assign({
      contextName: this.getContextName(entry.context),
      levelTagHighWater: this.longestAllowedLevelTag,
      tagHighWater: this.tagLengthHighWater,
    }, entry)
    if (!entryInfo.options) {
      entryInfo.options = {}
    }

    const options: ConsoleLogListenerOptions = Object.assign(
      {},
      this.config,
      this.config.levelOptions && this.config.levelOptions[entry.level],
    )

    const tagInfo = this.getTagInfo(options, entryInfo)
    const tag = this.getTag(options, tagInfo)

    this.tagLengthHighWater = tag.length > this.tagLengthHighWater ? tag.length : this.tagLengthHighWater

    console[entry.level](tag, ...entry.args)
  }

  private getLongestAllowedLevelTag() {
    const allowedLevels: LogLevel[] =
      Object.keys(LogLevel)
        .filter((level: LogLevel) => !this.isFiltered(level))
        .map(level => LogLevel[level])
    const tags = allowedLevels.map(level => {
      const options: ConsoleLogListenerOptions = Object.assign(
        {},
        this.config,
        this.config.levelOptions && this.config.levelOptions[level],
      )
      return this.getLevelTag(options, { level, options: {} } as ConsoleLogListenerEntryInfo)
    })
    return tags.reduce((result, tag) => tag.length < result ? result : tag.length, 0)
  }

  private isFiltered(entryLevel: LogLevel): boolean {
    const filter = this.config.filter && LogLevelFilter[this.config.filter]
    if (!filter) {
      return false
    }
    const entryLevelValue = LogLevelValue[entryLevel]
    return (entryLevelValue & filter) === 0
  }

  private tagDisabled(configValue: any, entryValue: boolean): boolean {
    return entryValue === false || configValue === false
  }

  private getTagInfo(options: ConsoleLogListenerOptions, entryInfo: ConsoleLogListenerEntryInfo): LogEntryTagInfo {
    const context = this.getContextTag(options, entryInfo)
    const level = this.getLevelTag(options, entryInfo)
    const timestamp = this.getTimestampTag(options, entryInfo)

    if (typeof options.tag === 'object') {
      return {
        context,
        level,
        levelTagHighWater: this.longestAllowedLevelTag,
        timestamp,
        partOrder: (options.tag && options.tag.partOrder) || DEFAULT_TAG_FORMAT_OPTIONS.partOrder,
        tagHighWater: this.tagLengthHighWater,
        tagPartSeparator: coalesceByDefined(options.tag.partSeparator, DEFAULT_TAG_FORMAT_OPTIONS.partSeparator),
        tagPrefix: coalesceByDefined(options.tag.prefix, DEFAULT_TAG_FORMAT_OPTIONS.prefix),
        tagSuffix: coalesceByDefined(options.tag.suffix, DEFAULT_TAG_FORMAT_OPTIONS.suffix),
      }
    }
    return {
      context,
      level,
      levelTagHighWater: this.longestAllowedLevelTag,
      timestamp,
      partOrder: DEFAULT_TAG_FORMAT_OPTIONS.partOrder,
      tagHighWater: this.tagLengthHighWater,
      tagPartSeparator: DEFAULT_TAG_FORMAT_OPTIONS.partSeparator,
      tagPrefix: DEFAULT_TAG_FORMAT_OPTIONS.prefix,
      tagSuffix: DEFAULT_TAG_FORMAT_OPTIONS.suffix,
    }
  }

  private getContextTag(options: ConsoleLogListenerOptions, entryInfo: ConsoleLogListenerEntryInfo): string {
    if (this.tagDisabled(this.config.contextTag, entryInfo.options.context)) {
      return undefined
    }
    const formatter = (typeof options.contextTag === 'function') ? options.contextTag : DEFAULT_CONTEXT_TAG
    return formatter(entryInfo)
  }

  private getContextName(context: InjectionContext) {
    return getInjectionContextName(context)
  }

  private getTimestampTag(options: ConsoleLogListenerOptions, entryInfo: ConsoleLogListenerEntryInfo): string {
    if (this.tagDisabled(this.config.timestampTag, entryInfo.options.timestamp)) {
      return undefined
    }
    switch (typeof options.timestampTag) {
      case 'string': return LUXON_TIMESTAMP_FORMATTER(entryInfo, options.timestampTag)
      case 'function': return options.timestampTag(entryInfo)
      case 'object': return LOCALE_TIMESTAMP_FORMATTER(entryInfo, options.timestampTag)
      default: return DEFAULT_TIMESTAMP_FORMATTER(entryInfo)
    }
  }

  private getLevelTag(options: ConsoleLogListenerOptions, entryInfo: ConsoleLogListenerEntryInfo): string {
    if (this.tagDisabled(this.config.levelTag, entryInfo.options.level)) {
      return undefined
    }
    const formatter = (typeof options.levelTag === 'function') ? options.levelTag : DEFAULT_LEVEL_TAG
    return formatter(entryInfo)
  }

  private getTag(options: ConsoleLogListenerOptions, tagInfo: LogEntryTagInfo): string {

    if (typeof options.tag === 'function') {
      return options.tag(tagInfo)
    }

    return DEFAULT_TAG_FORMAT_OPTIONS.formatter(tagInfo)

  }
}
