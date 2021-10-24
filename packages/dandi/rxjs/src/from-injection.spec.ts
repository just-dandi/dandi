import { Disposable } from '@dandi/common'
import { InjectionToken, Injector } from '@dandi/core'
import { fromInjection } from '@dandi/rxjs'

import { expect } from 'chai'
import { stub } from 'sinon'

describe.marbles.only('fromInjection', ({ cold }) => {
  /*
   * Note: cannot use the real Dandi test harness because the injector (and therefore any "test" injectable) gets disposed
   *       before the marbles logic can evaluate the observable
   *
   * Additionally, fromInjection is tricky to test with marbles because it uses a promise internally, which throws
   * off the timing used by the rxjs TestScheduler - due to the promise, the resulting Observable from fromInjection
   * doesn't emit until after the TestScheduler has done its processing. For this reason, the stubbed injector
   * returns the "injected" value directly as opposed to returning it wrapped in a promise
   */

  let TestInjectable: InjectionToken<any>

  beforeEach(() => {
    TestInjectable = class _TestInjectable {}
  })
  afterEach(() => {
    TestInjectable = undefined
  })

  const injector: Injector = {
    canResolve: undefined,
    context: undefined,
    createChild: undefined,
    invoke: undefined,
    parent: undefined,
    resolve: stub<[token: InjectionToken<any>], any>(),
    // hack alert: return a value instead of a promise - see explanation above
    //             use an array so it will be accepted by from()
    inject: stub<[token: InjectionToken<any>], Promise<any>>().callsFake(() => [TestInjectable] as any),
  }

  it('emits the injected value', async () => {
    const actual$ = fromInjection(injector, TestInjectable)

    expect(actual$).with.marbleValues({ a: TestInjectable }).to.equal('a')
  })

  it('completes when the disposeNotifier$ emits', () => {
    const dispose$ = cold('---d', { d: 'test dispose' })
    const actual$ = fromInjection(injector, TestInjectable, false, dispose$)
    const marbleValues = { a: TestInjectable }

    expect(actual$).with.marbleValues(marbleValues).to.equal('a--|')
  })

  it('completes when disposed externally', () => {
    const dispose$ = cold('---d|', { d: 'test dispose' })
    dispose$.subscribe((reason) => Disposable.dispose(TestInjectable, reason))
    const actual$ = fromInjection(injector, TestInjectable)
    const marbleValues = { a: TestInjectable }

    expect(actual$).with.marbleValues(marbleValues).to.equal('a--|')
  })
})
