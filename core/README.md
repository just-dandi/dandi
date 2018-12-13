# @dandi/core

Dandi's dependency injection is heavily influenced by [Angular](https://angular.io)'s
DI system.

## Concepts

- **Resolver** - responsible for resolving and instantiating dependencies
- **Container** - in Dandi, the main `Resolver` implementation, which
  also includes logic for discovering injectable services, as well as
  storing references of singleton dependencies
- **Provider** - An object which describes how a request for a dependency
  is resolved by providing the value directly, or describing how to create
  the value (class constructor, factory function, etc)
- **Injection Token** - A value that represents an injectable dependency.
  Can be a class constructor, or a `Symbol` value representing an
  interface or any other concept.
  
## Application Lifecycle
- TODO

## Describing Injectable Services

### @Injectable() Decorator

The simplest method of describing an injectable service is to add the
`@Injectable()` decorator to it. This tells the resolver that when it
encounters a dependency of the decorated class, it will instantiate a
new instance of that class:

```typescript
import { Injectable } from '@dandi/core';

@Injectable()
class MyService {}
```

The `@Injectable()` decorator can also be used to register a service for
a different injection token, such as a token representing an interface:

```typescript
import { InjectionToken, Provider, SymbolToken } from '@dandi/core';

export interface MyInterface {}

export const MyInterface: InjectionToken<MyInterface> = SymbolToken.for<MyInterface>('MyInterface');

@Injectable(MyInterface)
export class MyService implements MyInterface {}
```

_Note:_ The above pattern takes advantage of TypeScript's [declaration
merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html)
feature. Since interfaces are only types (and are not available
at runtime), there needs to be a concrete value to represent them.
Dandi uses a `const` of the same name to represent an interface's
injection token, allowing for consistency when looking at code using
the `@Injectable()` and `@Inject()` decorators.

### Providers

Providers allow you to configure the resolver to map any kind of token
to any value or implementation. They are most commonly used to register
implementations of interfaces.

#### Value Providers

A value provider allows mapping an existing value to an injection token.

```typescript
import { InjectionToken, Provider, SymbolToken } from '@dandi/core';

const SomeValue: InjectionToken<string> = SymbolToken.for<string>('SomeValue');

const SomeValueProvider: Provider<string> = {
  provide: SomeValue,
  useValue: 'any-value-you-like-here',
};
```

#### Factory Providers

A factory provider allows mapping a factory function to an injection
token. This can be helpful for making 3rd party classes injectable.

```typescript
import { InjectionToken, Provider, SymbolToken } from '@dandi/core';
import { S3 } from 'aws-sdk';

export function s3Factory(): S3 {
  return new S3({ endpoint: 'http://local-dev-endpoint' });
}

export const S3Provider: Provider<S3> = {
  provide: S3,
  useFactory: s3Factory,
};
```

#### Class Providers

A class provider allows mapping a class constructor to an injection token.

```typescript
import { InjectionToken, Provider, SymbolToken } from '@dandi/core';

export interface MyInterface {}

export const MyInterface: InjectionToken<MyInterface> = SymbolToken.for<MyInterface>('MyInterface');

export class MyService implements MyInterface {}

export const MyInterfaceProvider: Provider<MyInterface> = {
  provide: MyInterface,
  useClass: MyService,
};
```

In the above example, `MyInterfaceProvider` allows requests for
`MyInterface` to be resolved as instances of `MyService`.

## Describing Dependencies

Use the `@Inject()` decorator to describe dependencies in a constructor:

```typescript
@Injectable()
class ServiceA {

    public getSomething(): Promise<Something> {
        ...
    }

}

@Injectable()
class ServiceB {

    constructor(
        @Inject(ServiceA) private serviceA: ServiceA,
    ) {}

    public async doSomething(): Promise<void> {
        const something = await this.serviceA.getSomething();
        console.log(something);
    }

}
```

The `@Inject()` decorator can also be used to describe dependencies for
a function or method. While Dandi does not automatically wrap function
calls, decorated functions can be invoked by a `Resolver`'s `invoke` and
`invokeInContext` methods:

```typescript
// assigned elsewhere
declare const resolver: Resolver;

function doSomething(@Inject(MyService) myService: MyService): void {}

resolver.invoke(null, doSomething); // returns a Promise
```

### Optional Dependencies

Dependencies can be marked as option using the `@Optional()` decorator.
Optional dependencies that cannot be resolved will be passed as `null`.

```typescript
class MyService {
  constructor(
    @Inject(MyDependency)
    @Optional()
    private myDep: MyDependency,
  ) {}
}
```

## Service Discovery

Classes and providers that are used by an application must be passed to
the container at startup:

```typescript
import { Container } from '@dandi/core';

const appContainer = new Container({
    providers: [
        MyService,
        MyInterfaceProvider,
    ];
});
```

Values passed to the `providers` property can be class constructors,
`Provider` instances, or arrays of either.

Additionally, Dandi includes a `Scanner` interface which allows implementations
of automatic service discovery.

**AmbientInjectableScanner** will automatically register any services
marked with `@Injectable()` that located in any module loaded by NodeJS.

**FileSystemScanner** can be used in conjunction with
`AmbientInjectableScanner` to automatically load modules from paths
defined in its configuration.

## Application Startup and Bootstrapping

The container's `start()` method must be called to initialize the
container and start the application.

```typescript
import { Container } from '@dandi/core';

const appContainer = new Container({
    providers: [
        MyService,
        MyInterfaceProvider,
    ],
});

container.start();
```

Startup logic is defined by providing an implementation of the
`Bootstrapper` interface:

```typescript
import { Bootstrapper, Container, Inject, Injectable } from '@dandi/core';

@Injectable(Bootstrapper)
class AppBootstrapper implements Bootstrapper {

    constructor(
        @Inject(MyService) private myService: MyService,
    ) {}

    public start(): void {
        // start the app
        this.myService.listen();
    }

}

const appContainer = new Container({
    providers: [
        AppBootstrapper,
        MyService,
        MyInterfaceProvider,
    ];
});

container.start();
```

## Application Configuration
- TODO

### OnConfig

## Logging
- TODO
