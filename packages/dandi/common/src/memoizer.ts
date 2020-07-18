import { Constructor } from '@dandi/common'

export class Memoizer<T = any> {
  protected readonly trackedObjs = new Set<T>()
  protected readonly memos = new Map<Constructor, Map<string, Set<T>>>()

  // constructor(public readonly maxDepth = 1, protected readonly level: number = 0) {}

  public add(obj: T): Readonly<T> {
    if (this.trackedObjs.has(obj)) {
      return obj
    }

    let ctrMemos = this.memos.get(obj.constructor as Constructor)
    if (!ctrMemos) {
      ctrMemos = new Map<string, any>()
      this.memos.set(obj.constructor as Constructor, ctrMemos)
    }

    const keys = Object.getOwnPropertyNames(obj).sort()
    const ctrMemoKey = keys.join('|')
    let instances = ctrMemos.get(ctrMemoKey)
    if (!instances) {
      instances = new Set()
      ctrMemos.set(ctrMemoKey, instances)
    }

    if (instances.has(obj)) {
      return obj
    }

    const existing = [...instances.values()].find((inst) => keys.every((key) => inst[key] === obj[key]))
    if (existing) {
      return existing
    }

    instances.add(obj)
    return obj
  }
}
