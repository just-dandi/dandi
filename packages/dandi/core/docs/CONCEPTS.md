## Concepts

- **[[Injector]]** - responsible for resolving and instantiating dependencies
- **[[Provider]]** - An object which describes how a request for a dependency
  is resolved by providing the value directly, or describing how to create
  the value (class constructor, factory function, etc)
- **[[InjectionToken]]** - A value that represents an injectable dependency.
  Can be a class constructor, or a `Symbol` value representing an
  interface or any other concept.
