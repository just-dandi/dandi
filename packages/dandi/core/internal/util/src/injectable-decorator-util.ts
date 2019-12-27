import { InjectableOption } from '@dandi/core/types'

export function isInjectableOption(obj: any): obj is InjectableOption {
  return obj instanceof InjectableOption
}
