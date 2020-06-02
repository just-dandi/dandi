export type MetadataAccessor<TMeta> = <T>(target: any) => TMeta

/**
 * @internal
 *
 * @param key
 * @param init
 * @param target
 * @param allowSuper controls whether existing metadata can be retrieved from a super class
 */
export function getMetadata<T>(key: symbol, init: () => T, target: any, allowSuper: boolean = false): T {
  let meta: T = (allowSuper || target.hasOwnProperty(key)) ? Reflect.get(target, key) : undefined
  if (!meta) {
    meta = init ? init() : ({} as T)
    Reflect.set(target, key, meta)
  }
  return meta
}
