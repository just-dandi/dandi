export type ObjectFactory<T> = (...args: any[]) => T | Promise<T>

export async function getInstance<T extends object>(factory: T | Promise<T> | ObjectFactory<T>, ...args: any[]): Promise<T> {
  if (typeof factory === 'function') {
    return (factory as ObjectFactory<T>)(...args)
  }
  return factory
}
