const LAZY = Symbol.for('__lazy_properties__')

type LazyProps = Set<string | symbol>

function lazyClassDecorator(target: Function): void {
  const lazyProps: LazyProps = (target as any)[LAZY]

  if (!lazyProps) {
    throw new Error(`No lazy properties have been defined on class ${target.name}`)
  }

  for (const propertyKey of lazyProps) {
    const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyKey)
    if (!descriptor?.get) {
      throw new Error(`No get accessor for lazy property ${target.name}.${String(propertyKey)}`)
    }
    if (descriptor.set) {
      throw new Error(`@Lazy() cannot be used with a set accessor (on ${target.name}.${String(propertyKey)})`)
    }
    const lazy = Symbol.for(`__lazy_${propertyKey.toString()}`)
    function lazyGet(this: unknown): unknown {
      /* eslint-disable no-invalid-this */
      if (!this[lazy]) {
        this[lazy] = descriptor.get.bind(this)()
      }
      return this[lazy]
      /* eslint-enable no-invalid-this */
    }
    Object.defineProperty(target.prototype, propertyKey, {
      get: lazyGet,
    })
  }
}

function lazyPropertyDecorator(target: Object, propertyKey: string | symbol): void {
  const ctr: any = target.constructor
  const lazyProps: LazyProps = ctr[LAZY] || new Set<string | symbol>()
  lazyProps.add(propertyKey)
  ctr[LAZY] = lazyProps
}

export function Lazy(): PropertyDecorator & ClassDecorator {
  return function lazyDecorator(target: Object | Function, propertyKey?: string | symbol): void {
    if (propertyKey) {
      lazyPropertyDecorator(target, propertyKey)
    } else {
      lazyClassDecorator(target as Function)
    }
  }
}
