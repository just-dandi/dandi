import { CustomInjectionScope } from './injection-scope'

const DEFINED_SCOPE_KEYS = new Set<symbol>()

export type PredefinedInjectionScope<TDescription extends string> = CustomInjectionScope & {
  readonly description: TDescription
  readonly type: unique symbol
}

export function defineScope<TDescription extends string>(
  description: TDescription,
): PredefinedInjectionScope<typeof description> {
  const key = Symbol.for(description)
  if (DEFINED_SCOPE_KEYS.has(key)) {
    throw new Error(
      `The application has already defined a scope using the key '${description}'. Use a unique key for each predefined scope.`,
    )
  }
  return Object.create(
    {},
    {
      description: {
        enumerable: true,
        value: description,
        writable: false,
      },
      type: {
        enumerable: true,
        value: key,
        writable: false,
      },
    },
  )
}
