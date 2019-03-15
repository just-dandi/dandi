## Describing Injectable Services

### @Injectable() Decorator

The simplest method of describing an injectable service is to add the
[[Injectable]] decorator to it. This tells the resolver that when it
encounters a dependency of the decorated class, it will instantiate a
new instance of that class:

```typescript
import { Injectable } from '@dandi/core'

@Injectable()
class MyService {}
```

The `@Injectable()` decorator can also be used to register a service for
a different injection token, such as a token representing an interface:

```typescript
import { InjectionToken, Provider, SymbolToken } from '@dandi/core'

export interface MyInterface {}

export const MyInterface: InjectionToken<MyInterface> = SymbolToken.for<MyInterface>('MyInterface')

@Injectable(MyInterface)
export class MyService implements MyInterface {}
```

_Note:_ The above pattern takes advantage of TypeScript's [declaration
merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
feature. Since interfaces are only types (and are not available
at runtime), there needs to be a concrete value to represent them.
Dandi uses a `const` of the same name to represent an interface's
injection token, allowing for consistency when looking at code using
the [[Injectable]] and [[Inject]] decorators.

### Providers

Providers allow you to configure the resolver to map any kind of token
to any value or implementation. They are most commonly used to register
implementations of interfaces.

#### Value Providers

A value provider allows mapping an existing value to an injection token.

```typescript
import { InjectionToken, Provider, SymbolToken } from '@dandi/core'

const SomeValue: InjectionToken<string> = SymbolToken.for<string>('SomeValue')

const SomeValueProvider: Provider<string> = {
  provide: SomeValue,
  useValue: 'any-value-you-like-here',
}
```

#### Factory Providers

A factory provider allows mapping a factory function to an injection
token. This can be helpful for making 3rd party classes injectable.

```typescript
import { InjectionToken, Provider, SymbolToken } from '@dandi/core'
import { S3 } from 'aws-sdk'

export function s3Factory(): S3 {
  return new S3({ endpoint: 'http://local-dev-endpoint' })
}

export const S3Provider: Provider<S3> = {
  provide: S3,
  useFactory: s3Factory,
}
```

#### Class Providers

A class provider allows mapping a class constructor to an injection token.

```typescript
import { InjectionToken, Provider, SymbolToken } from '@dandi/core'

export interface MyInterface {}

export const MyInterface: InjectionToken<MyInterface> = SymbolToken.for<MyInterface>('MyInterface')

export class MyService implements MyInterface {}

export const MyInterfaceProvider: Provider<MyInterface> = {
  provide: MyInterface,
  useClass: MyService,
}
```

In the above example, `MyInterfaceProvider` allows requests for
`MyInterface` to be resolved as instances of `MyService`.
