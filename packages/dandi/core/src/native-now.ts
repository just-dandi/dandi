import { ValueProvider } from './provider'
import { Now, NowFn } from './now'

function nativeNow(): number {
  return new Date().valueOf()
}

export const NativeNow: ValueProvider<NowFn> = {
  provide: Now,
  useValue: nativeNow,
}
