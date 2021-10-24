import { MonoTypeOperatorFunction, Observable, Operator, Subscriber, Subscription, TeardownLogic } from 'rxjs'

import { DequeueReplaySubject, TriggerSelectorFn } from './dequeue-replay-subject'

/**
 * Returns a new {@link Observable} that stores emitted values in an internal queue, and replays them to subsequent
 * subscribers. The queued values are removed from the internal queue when they are emitted from `dequeueTrigger`.
 *
 * ![](dequeueReplay.png)
 *
 * @see {@link DequeueReplaySubject}
 * @see {@link ReplaySubject}
 * @see {@link publishReplay}
 *
 * @param dequeueTrigger An {@link Observable} that emits values to be removed from the internal queue of events
 */
export function dequeueReplay<TStream>(dequeueTrigger: Observable<TStream>): MonoTypeOperatorFunction<TStream>
export function dequeueReplay<TStream, TTrigger>(
  dequeueTrigger: Observable<TTrigger>,
  selectorFn: TriggerSelectorFn<TStream, TTrigger>,
): MonoTypeOperatorFunction<TStream>
export function dequeueReplay<TStream, TTrigger>(
  dequeueTrigger: Observable<TTrigger>,
  selectorFn?: TriggerSelectorFn<TStream, TTrigger>,
): MonoTypeOperatorFunction<TStream> {
  return (source: Observable<TStream>) => source.lift(new DequeueReplayOperator(dequeueTrigger, selectorFn))
}

class DequeueReplayOperator<TStream, TTrigger> implements Operator<TStream, TStream> {
  private readonly subject: DequeueReplaySubject<TStream, TTrigger>
  private readonly sources: Set<any> = new Set<any>()
  private sourceSub: Subscription | undefined = undefined

  constructor(dequeueTrigger: Observable<TTrigger>, selectorFn?: TriggerSelectorFn<TStream, TTrigger>) {
    this.subject = new DequeueReplaySubject<TStream, TTrigger>(dequeueTrigger, selectorFn)
  }

  call(subscriber: Subscriber<TStream>, source: any): TeardownLogic {
    this._addSource(source)
    return this.subject.subscribe(subscriber)
  }

  _addSource(source: any): void {
    if (this.sources.has(source)) {
      return
    }

    const sub = source.subscribe(this.subject)
    this.sources.add(source)

    if (this.sourceSub) {
      this.sourceSub.add(sub)
    } else {
      this.sourceSub = sub
    }
  }
}
