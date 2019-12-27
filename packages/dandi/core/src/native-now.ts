import { Now, NowFn, ValueProvider } from '@dandi/core/types'

function nativeNow(): number {
  return new Date().valueOf()
}

export const NativeNow: ValueProvider<NowFn> = {
  provide: Now,
  useValue: nativeNow,
}
