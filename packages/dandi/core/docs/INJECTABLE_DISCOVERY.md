## Injectable Discovery

Classes and providers that are used by an application must be passed to
the container at startup:

```typescript
import { DandiApplication } from '@dandi/core'

const app = new DandiApplication({
  providers: [
    MyService,
    MyInterfaceProvider,
  ],
})
```

Values passed to the `providers` property can be [[Module]] references,
class constructors, [[Provider]] instances, or arrays of either.

Additionally, Dandi includes a [[Scanner]] interface which allows implementations
of automatic service discovery.

**[[AmbientInjectableScanner]]** will automatically register any services
marked with [[Injectable]] that located in any module loaded by NodeJS.

**[[FileSystemScanner]]** can be used in conjunction with
[[AmbientInjectableScanner]] to automatically load modules from paths
defined in its configuration.
