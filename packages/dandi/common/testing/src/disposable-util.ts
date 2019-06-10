import { Disposable } from '@dandi/common'

import { DISABLE_REMAP } from '../../src/disposable-flags'

/**
 * A utility for working with {@see Disposable} instances during testing.
 */
export class DisposableUtil {

  /**
   * Uses `beforeEach` and `afterEach` to disable the [[Disposable.remapDisposed]] functionality for the duration of
   * each test. Disposed objects will still be marked as disposed, and will correctly show as disposed when used with
   * [[Disposable.isDisposed]] and [[Disposable.getDisposedReason]], but will not throw errors on member access.
   */
  public static disableRemap(): void {
    const ogValue = Disposable[DISABLE_REMAP]
    beforeEach(function() {
      Disposable[DISABLE_REMAP] = true
    })
    afterEach(function() {
      Disposable[DISABLE_REMAP] = ogValue
    })
  }

}
