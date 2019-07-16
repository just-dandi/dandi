import { Disposable } from '@dandi/common'

import { DISABLE_REMAP } from '../../src/disposable-flags'

export class DisposableUtil {

  public static disableRemap(): void {
    const ogValue = Disposable[DISABLE_REMAP]
    beforeEach(function() {
      Disposable[DISABLE_REMAP] = true
    })
    afterEach(function() {
      Disposable[DISABLE_REMAP] = ogValue
    })
  }

  // public static disableRemap(): void {
  //   this[DISABLE_REMAP] = Disposable[DISABLE_REMAP]
  //   Disposable[DISABLE_REMAP] = true
  // }
  //
  // public static restoreRemap(): void {
  //   Disposable[DISABLE_REMAP] = this[DISABLE_REMAP]
  //   delete this[DISABLE_REMAP]
  // }

}
