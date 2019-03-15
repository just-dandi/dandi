export type MetadataAccessor<TMeta> = <T>(target: any) => TMeta

/**
 * @internal
 * @ignore
 */
export function getMetadata<T>(key: symbol, init: () => T, target: any): T {
  let meta: T = Reflect.get(target, key)
  if (!meta) {
    meta = init ? init() : ({} as T)
    Reflect.set(target, key, meta)
  }
  return meta
}
