import { Disposable } from '@dandi/common'
import { InjectionToken, Injector, MultiInjectionToken, SingleInjectionToken } from '@dandi/core'
import {
  finalize,
  from,
  merge,
  mergeMap,
  NEVER,
  Observable,
  of,
  shareReplay,
  Subject,
  take,
  takeUntil,
  tap,
} from 'rxjs'
import { share } from 'rxjs/operators'

import { silence } from './silence'

export function fromInjection<T>(
  injector: Injector,
  token: MultiInjectionToken<T>,
  optional?: boolean,
  disposeNotifier$?: Observable<string>,
): Observable<T[]>
export function fromInjection<T>(
  injector: Injector,
  token: SingleInjectionToken<T>,
  optional?: boolean,
  disposeNotifier$?: Observable<string>,
): Observable<T>
export function fromInjection<T>(
  injector: Injector,
  token: InjectionToken<T>,
  optional?: boolean,
  disposeNotifier$?: Observable<string>,
): Observable<T | T[]>
export function fromInjection<T>(
  injector: Injector,
  token: InjectionToken<T>,
  optional: boolean = false,
  disposeNotifier$: Observable<string> = NEVER,
): Observable<T | T[]> {
  return from(injector.inject(token, optional))
    .pipe(
      mergeMap((injected) => {
        // use makeDisposable to create a dispose trigger so that the observable will complete if the injected
        // value is disposed from somewhere else
        const dispose$$ = new Subject<string>()
        Disposable.makeDisposable(injected, (reason) => dispose$$.next(reason))

        const dispose$ = merge(disposeNotifier$ ?? NEVER, dispose$$).pipe(
          take(1),
          tap((reason) => Disposable.dispose(injected, reason)),
          silence(),
          share(),
        )
        return merge(of(injected), dispose$).pipe(
          takeUntil(dispose$),
          finalize(() => dispose$$.complete()),
        )
      }),
    )
    .pipe(shareReplay(1))
}

export function fromSingleInjection<T>(
  injector: Injector,
  token: InjectionToken<T>,
  optional: boolean = false,
  disposeNotifier$?: Observable<string>,
): Observable<T> {
  return fromInjection(injector, token, optional, disposeNotifier$) as Observable<T>
}
