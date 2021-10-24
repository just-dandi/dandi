import { randomInt } from '@dandi/common'
import { SchedulerAction, SchedulerLike, Subscription } from 'rxjs'
import { Action } from 'rxjs/internal/scheduler/Action'

class RandomIntervalAction<TState = any> extends Action<TState> implements SchedulerAction<TState> {
  constructor(
    private readonly scheduler: RandomIntervalScheduler,
    private readonly work: (this: SchedulerAction<TState>, state?: TState) => void,
  ) {
    super(scheduler as any, work)
  }

  public schedule(state?: TState, delay?: number): Subscription {
    setTimeout(
      () => this.work(state),
      randomInt(delay - this.scheduler.variation, delay + this.scheduler.variation),
    )
    return this
  }
}

export class RandomIntervalScheduler implements SchedulerLike {
  constructor(public readonly variation: number) {}

  public now(): number {
    return Date.now()
  }

  public schedule<T>(
    work: (this: SchedulerAction<T>, state?: T) => void,
    delay?: number,
    state?: T,
  ): Subscription {
    return new RandomIntervalAction(this, work).schedule(state, delay)
  }
}
