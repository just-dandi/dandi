import { ValueProvider } from './provider'
import { NowFn } from './now-fn'

function nativeNow(): number {
  return new Date().valueOf()
}

/**
 * A {@see Provider} for {@see NowFn} that uses JavaScript's native `Date` object to generate a timestamp
 */
export const NativeNow: ValueProvider<NowFn> = {
  provide: NowFn,
  useValue: nativeNow,
}
