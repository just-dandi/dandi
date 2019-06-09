import { PerfRecorder } from './perf.recorder'

export interface PerfRecordEntry {
  component: string;
  name: string;
  sinceLast: [number, number];
  sinceStart: [number, number];
  time: [number, number];
}

/* eslint-disable no-magic-numbers */
const SEPARATOR = new Array(126).join('-') + '\n'
const COLS = ` ${'component'.padEnd(45)} | ${'name'.padEnd(35)} | ${'time'.padEnd(17)} | ${'diff'.padEnd(17)}\n`

function timeString(time: [number, number]): string {
  return `${time[0]}.${time[1].toString().padStart(9, '0')}`
}
/* eslint-enable */

export class PerfRecord implements PerfRecorder {
  private _entries: PerfRecordEntry[] = []
  public get entries(): PerfRecordEntry[] {
    return this._entries
  }

  private readonly start: [number, number]
  private last: [number, number]

  constructor(component: string, name: string) {
    this.start = process.hrtime()
    this.last = this.start
    this.mark(component, name)
  }

  public mark(component: string, name: string): [number, number] {
    const sinceLast = process.hrtime(this.last)
    const sinceStart = process.hrtime(this.start)
    const time = process.hrtime()
    this._entries.push({
      component,
      name,
      sinceLast,
      sinceStart,
      time,
    })
    return (this.last = time)
  }

  /* eslint-disable no-magic-numbers */
  public toString(): string {
    return (
      this.entries.reduce((result, entry) => {
        result += ` ${entry.component.padEnd(45)} |`
        result += ` ${entry.name.padEnd(35)} |`
        result += ` ${timeString(entry.time).padEnd(17)} |`
        result += ` ${timeString(entry.sinceLast).padEnd(17)}\n`
        return result
      }, '\n' + SEPARATOR + COLS + SEPARATOR) + SEPARATOR
    )
  }
  /* eslint-enable */
}
