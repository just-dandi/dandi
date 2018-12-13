import { getInjectionContextName, Injectable, InjectionContext } from '@dandi/core'

import { LogEntry } from './log-entry'
import { LogListener } from './log-listener'

@Injectable(LogListener)
export class ConsoleLogListener implements LogListener {

  private contextLengthHighWater = 0

  // TODO: configurable filter by log level
  constructor() {}

  public log(entry: LogEntry): void {
    const contextTag = `[${entry.ts} ${this.getContextTag(entry.context)}]`
    this.contextLengthHighWater = contextTag.length > this.contextLengthHighWater ? contextTag.length : this.contextLengthHighWater
    // TODO: allow configurable formatting - templated strings or a function
    //  - timestamp format with Luxon
    //  - context tag format - prefix/suffix to enable colorizing
    //  - args format - prefix/suffix to enable colorizing
    //  - for all above: separate configs for each log level, as well as a default
    console[entry.level](contextTag.padEnd(this.contextLengthHighWater, ' '), ...entry.args)
  }

  private getContextTag(context: InjectionContext) {
    return getInjectionContextName(context)
  }
}
