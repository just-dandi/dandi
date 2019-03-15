# shared:optional
when set to `true`, returns `undefined` instead of throwing an error

# shared:parent-resolver-context
An alternate [[ResolverContext]] instance to use for resolving the specified
[[InjectionToken]] and any dependencies

# shared:providers
any additional [[Provider]] objects to use for resolving the `token`

# resolve
Attempts to resolve the specified [[InjectionToken]]. Resolves to a single [[Provider]]
object for non-multi providers, or a `Set<Provider>` for multi providers.

# resolve:token
the [[InjectionToken]] to check

# invoke
Invokes `methodName` on the specified `instance` and returns a `Promise` that is resolved
to the resulting return value.

# invoke:instance
The object that will be used as the `this` object when invoking the method

# invoke:methodName
The name of a public method on the specified `instance`
