# @dandi/common

`@dandi/common` provides common types and utilities for the rest of the
`@dandi` system.

`@dandi/common` does not have any dependencies on NodeJS, and therefore
can be used on classes shared with projects targeted for the web.

## Disposable

The `Disposable` interface allows implementing classes to define
 behavior for cleaning up resources like IO streams, database
 connections, as well as Observable and other event subscriptions.

When used with `@dandi/core`, `Disposable` instances are
 automatically disposed by Dandi at the end of their lifecycle.

```typescript
class MyService implements Disposable {

    constructor(private dbClient: DbClient) {}

    public dispose(reason: string): void {
        this.dbClient.release();
    }

}
```

### Disposable Utilities

`Disposable` is also a static class provides several utility functions:

* **isDisposable(obj)** - Returns `true` if the object implements
 `dispose()`; otherwise, `false`.

* **makeDisposable(obj, disposeFn)** - Modifies the specified object to
 add the provided {@see DisposeFn} as the `Disposable.dispose`
 implementation. If the object already has a function member named
 `dispose`, it is wrapped and called before the new function.

* **use(obj, fn)** - Invokes the specified function in a `try`/`catch`,
 statement, then `finally` disposes the object. Returns the value
 returned by `fn`, or rethrows the error thrown by it.

* **useAsync(obj, fn)** - Same as `use`, but `fn` is invoked using `await`.

* **remapDisposed(target, reason)** - Overwrites members of the target
 such that functions and property/field accessors throw an
 `AlreadyDisposedError`, a read-only `disposed` property is set with
 the value `true`, and the target is frozen (using `Object.freeze`) to
 prevent further modification.
