import { Provider } from './provider'
import { Now, NowFn } from './now'

function nativeNow(): number {
  return new Date().valueOf()
}

export const NativeNow: Provider<NowFn> = {
  provide: Now,
  useValue: nativeNow,
}
