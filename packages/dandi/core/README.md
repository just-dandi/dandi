# @dandi/core

Dandi's dependency injection is heavily influenced by [Angular](https://angular.io)'s
DI system.

## Concepts

- **Injection Token** - A value that represents an injectable dependency. An Injection token can be a class
  constructor, or a `Symbol` value. Injection tokens represent a contract or logical concept within the framework or
  an application, without caring about its implementation.

- **Provider** - An object which describes the implementation of the contract of concept represented by an Injection
  Token. The implementation can be an constant value, or can be generated using a class constructor or factory function.

- **Injector** - The service responsible for creating instances of injectables.

## Patterns

### Declaration Merging for Injection Tokens

Dandi frequently uses `InjectionToken` objects to represent contracts or services defined only using an interface.
Rather than give the interface and token separate names (and by convention, different casing), Dandi uses identical
names, including casing, for interfaces and their corresponding injection tokens. This is possible due to TypeScript's
[declaration merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) feature, and provides a
more consistent feel when injecting services that use this pattern:

```
// injection token
export const SomeService = SymbolToken.for('SomeService')

// interface
export interface SomeService {
  doTheWork(): void
}

// usage
class MyClass {
  constructor(@Inject(SomeService) private someService: SomeService) { }
}
```

## Describing Injectable Services

### @Injectable() Decorator

The simplest method of describing an injectable service is to add the `@Injectable()` decorator to it. This tells the
injector that when it encounters a dependency of the decorated class, it will instantiate a new instance of that class:

```typescript
import { Injectable } from '@dandi/core'

@Injectable()
class MyService {}
```

The `@Injectable()` decorator can also be used to register a service for
a different injection token, such as a token representing an interface:

```typescript
// my-interface.ts
import { InjectionToken, SymbolToken } from '@dandi/core'

export interface MyInterface {}

export const MyInterface: InjectionToken<MyInterface> = SymbolToken.for<MyInterface>('MyInterface')

// my-service.ts
import { Injectable } from '@dandi/core'
import { MyInterface } from './my-interface'

@Injectable(MyInterface)
export class MyService implements MyInterface {}
```

### Providers

Providers allow you to configure the injector to map any kind of token
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
    const something = await this.serviceA.getSomething()
    console.log(something)
  }

}
```

The `@Inject()` decorator can also be used to describe dependencies for
a function or method. While Dandi does not automatically wrap function
calls, decorated functions can be invoked by an `Injector`'s `invoke` method:

```typescript
@Injectable()
class MyService {
  constructor(@Inject(Injector) private injector: Injector) {}

  public async doSomething(): Promise<void> {
    await this.injector.invoke(this, 'invokableMethod') // returns a Promise
  }

  public invokableMethod(@Inject(MyDependency) myDep: MyDependency): void {}
}
```

### Optional Dependencies

Normally, if the injector cannot find a provider for a dependency, it will throw an error. However, dependencies can be
marked as optional using the `@Optional()` decorator. Optional dependencies that cannot be resolved will be passed as
`undefined`.

```typescript
class MyService {
  constructor(@Inject(MyDependency) @Optional() private myDep: MyDependency) {}
}
```

## Service Discovery

Classes and providers that are used by an application must be configured with the `DandiApplication` instance:

```typescript
import { DandiApplication } from '@dandi/core'

const app = new DandiApplication({
  providers: [MyService, MyInterfaceProvider],
})
```

Values passed to the `providers` property can be class constructors, `Provider` instances, `Module` instances, or
arrays of any combination thereof. Additionally, arrays of injectables can be nested as desired - the DI system will
unpack any level of nesting.

### Modules

In Dandi, a `Module` is a grouping dependencies, allowing many dependencies to be registered in an application with a
single line of code. Additionally, modules may expose helper methods for configuring the services or settings included
with the module.

```typescript
import { DandiApplication } from '@dandi/core'
import { ConsoleLogListener, LoggingModule } from '@dandi/core/logging'
import { PrettyColorsLogging } from '@dandi/logging'

const app = new DandiApplication({
  providers: [LoggingModule.use(ConsoleLogListener, PrettyColorsLogging)],
})
```

## Injectable Instances and the Injector Hierarchy

### Injector Hierarchy

The Dandi DI system starts with a "root" injector, where all the providers defined in the application's configuration
are registered. When executing a dependency injection request (`inject` or `invoke`), a child injector is created to
service the specific request. This injector is given an `InjectionScope`, which identifies the purpose for which the
injector was created. Each injector has access to the providers registered to it as well as all of its parents.

Creating a child injector can also be done manually using `Injector.createChild(scope, ...providers)`. Creating a child
injector also provides an opportunity to add additional providers for the new injector.

### Injectable Instances

Each provider can create at most one instance per injector. When an instance is created, a reference to that instance
is stored with the injector matching its scope restriction as described below, or the injector where the provider is
registered. Subsequent requests for the same injection token within the same scope will result in the same instance
being injected.

### Scope Restrictions

A scope restriction can be defined on either a provider or an injection token. If both a provider and an injection token
define a restriction, the restriction from the injection token is used. A scope restriction may be any value included
in the `InjectionScope` type - a class constructor, a function, a `DependencyInjectionScope` instance, or an object
implementing `CustomInjectionScope`.

- Injection tokens can define a scope restriction if they are instances of `OpinionatedInjectionToken`, and set the
  `restrictScope` option
- Provider objects specify a scope restriction by including a `restrictScope` key
- Classes can specify a scope restriction by passing the `RestrictScope` modifier with the `@Injectable` decorator:
  `@Injectable(RestrictScope(MyCustomScope))`

#### Default Scoping

When neither a provider nor its injection token specifies a scope restriction, the provider will be used to generate a
single instance, which will be scoped to the injector where the provider was registered. For example, if a provider
is specified in an application's configuration, it will only ever be used to create one instance, and that instance will
be reused throughout the entire application, no matter which level of the injector hierarchy injects it.

#### Restricted Scope

When a scope restriction is defined, the injectable will be restricted to being injected only as a child of a scope
matching the defined restriction. Restricting scope is useful any time an application is processing multiple streams of
data that must remain separate - for example, handling HTTP requests. When creating instances of scope restricted
injectables, the instance is created and stored in the first injector that both has access to a provider providing
the requested injection token, and has, or is a child of a matching injection scope.

#### Scope Behaviors

A `ScopeBehavior` allows additional options for controlling how and where injectable instances are created.

##### perInjector

`ScopeBehavior.perInjector` forces a new instance of an injectable to be created for each injector that uses it. It can
also be invoked with an `InjectionScope`, which will add a scope restriction on top of the `perInjector` behavior:
`ScopeBehavior.perInjector(MyCustomScope)`

## Application Lifecycle

- `app.start()` or `app.run()`
- **Pre-Init** - Providers defined in container configuration are registered with the internal provider repository
- **Init** - `InjectorContextFactory` is bound, scanners are run
- **Config** - Provided implementations of `OnConfig` are invoked
- **Bootstrap** - The `EntryPoint` implementation, if provided, is instantiated and invoked

## Application Startup and Bootstrapping

The container's `start()` or `run()` method must be called to initialize the
container and start the application.

```typescript
import { DandiApplication } from '@dandi/core'

const app = new DandiApplication({
  providers: [MyService, MyInterfaceProvider],
})

app.run()
```

- **`app.start()`** returns a `Promise` that resolves to the `Injector` instance created by the application.
  The injector can then be used to invoke or inject objects configured in the application.

- **`app.run()`** returns a `Promise` that resolves to the value returned by the configured `EntryPoint`
  implementation.

Startup logic is defined by providing an implementation of the `EntryPoint` interface:

```typescript
import { EntryPoint, DandiApplication, Inject, Injectable } from '@dandi/core'

@Injectable(EntryPoint)
class MyApp implements EntryPoint {
  constructor(@Inject(MyService) private myService: MyService) {}

  public run(): void {
    // start the app
    this.myService.listen()
  }
}

const app = new DandiApplication({
  providers: [MyApp, MyService, MyInterfaceProvider],
})

app.run()
```

## Application Configuration

- TODO

### OnConfig

- TODO

## Logging

See documentation for [@dandi/core/logging](./logging)
