export class RangeIterator implements Iterator<number> {
  private _current: number
  public get current(): number {
    return this._current
  }

  constructor(public readonly range: Range) {}

  public next(): IteratorYieldResult<number> | IteratorReturnResult<any> {
    if (typeof this.current === 'undefined') {
      this._current = this.range.start
      return this.return(this.current)
    }

    if (
      (this.range.direction > 0 && (this._current >= this.range.end || this._current < this.range.start)) ||
      (this.range.direction < 0 && (this._current <= this.range.end || this._current > this.range.start))
    ) {
      return this.return()
    }

    this._current += this.range.increment
    return this.return(this.current)
  }

  public return(value?: number): IteratorResult<number, number> {
    return {
      done: typeof value === 'undefined',
      value: typeof value === 'undefined' ? this.current : value,
    }
  }
}

export class Range implements Iterable<number> {
  public readonly direction: 1 | -1

  constructor(public readonly start: number, public readonly end: number, public readonly increment?: number) {
    this.direction = start < end ? 1 : -1
    if (typeof increment === 'undefined') {
      this.increment = this.direction
    }
  }

  public by(increment: number): Range {
    return new Range(this.start, this.end, increment)
  }

  public forEach(fn: (x: number) => void): void {
    for (const x of this) {
      fn(x)
    }
  }

  public map<T>(fn: (x: number, index: number) => T): T[] {
    const result = []
    let index = 0
    for (const x of this) {
      result.push(fn(x, index++))
    }
    return result
  }

  public reduce<T>(fn: (previousValue: T, currentValue: number, currentIndex: number) => T, initialValue?: T): T {
    let result = initialValue
    let index = 0
    for (const x of this) {
      result = fn(result, x, index++)
    }
    return result
  }

  public [Symbol.iterator](): Iterator<number> {
    return new RangeIterator(this)
  }
}

export function range(startOrCount: number, end?: number, increment?: number): Range {
  let start: number
  if (typeof end === 'undefined') {
    start = 0
    end = startOrCount
  } else {
    start = startOrCount
  }
  const builder = new Range(start, end)
  if (typeof increment === 'number') {
    return builder.by(increment)
  }
  return builder
}
