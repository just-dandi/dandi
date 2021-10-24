import { Observable, PartialObserver, Subject, Subscription } from 'rxjs'

export type TriggerSelectorFn<TStream, TTrigger> = (trigger: TTrigger, event: TStream) => boolean

function defaultSelectorFn<TStream, TTrigger>(trigger: TTrigger, event: TStream): boolean {
  return (event as any) === (trigger as any)
}

export const defaultSelector: TriggerSelectorFn<any, any> = defaultSelectorFn

/**
 * A variant of {@link Subject} that "replays" old values to new subscribers by emitting them when they first subscribe.
 *
 * While similar in behavior to {@link ReplaySubject}, `DequeueReplaySubject` allows the "old" values to be removed by
 * specifying a "dequeue trigger" {@link Observable}. Any values emitted from the "dequeue trigger" are removed from the
 * array of "old" values if they are present, and will not be emitted to future subscribers.
 *
 * `DequeueReplaySubject` subscribes to the "dequeue trigger" Observable the first time a value is emitted, before the
 * value is added to the internal array of values, and before the value is re-emitted. This allows values to be
 * "dequeued" immediately. The "dequeue trigger" subscription remains active until the `DequeueReplaySubject` completes
 * AND all queued events have been dequeued, OR the "dequeue trigger" Observable errors. If the "dequeue trigger"
 * errors, the `DequeueReplaySubject` will also emit the same error. If this behavior is undesired, pipe the
 * "dequeue trigger" Observable through the {@link catchError} operator before passing it to the `DequeueReplaySubect`
 * constructor.
 *
 * @see {@link dequeueReplay}
 */
export class DequeueReplaySubject<TStream, TTrigger = TStream> extends Subject<TStream> {
  private readonly _events: TStream[] = []
  private _dequeueSub: Subscription | undefined = undefined

  constructor(
    private dequeueTrigger: Observable<TTrigger>,
    private selectorFn: TriggerSelectorFn<TStream, TTrigger> = defaultSelector,
  ) {
    super()
  }

  next(value: TStream): void {
    this._dequeue()
    this._events.push(value)
    super.next(value)
  }

  subscribe(observer?: PartialObserver<TStream>): Subscription
  subscribe(next?: (value: TStream) => void, error?: (error: any) => void, complete?: () => void): Subscription
  subscribe(
    observerOrNext?: PartialObserver<TStream> | ((value: TStream) => void) | null,
    error?: ((error: any) => void) | null,
    complete?: (() => void) | null,
  ): Subscription {
    let observer: PartialObserver<TStream>
    if (typeof observerOrNext === 'function') {
      observer = { next: observerOrNext, error, complete }
    } else {
      observer = observerOrNext
    }

    const sink = new Subject()
    const sinkSub = sink.subscribe(observer)
    this._events.forEach(sink.next.bind(sink))

    const sub = super.subscribe(sink)
    sub.add(sinkSub)
    sub.add(() => sink.complete())

    return sub
  }

  /** @internal */
  _dequeue(): void {
    if (!this._dequeueSub) {
      this._dequeueSub = this.dequeueTrigger.subscribe(this._dequeueNext.bind(this), this.error.bind(this))
    }
  }

  /** @internal */
  _dequeueNext(trigger: TTrigger): void {
    const matched = this._events.filter(this.selectorFn.bind(undefined, trigger))
    matched.forEach((event) => this._events.splice(this._events.indexOf(event), 1))
    if (this.isStopped && !this._events.length && this._dequeueSub) {
      this._dequeueSub.unsubscribe()
    }
  }
}
