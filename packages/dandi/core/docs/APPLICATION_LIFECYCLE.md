## Application Lifecycle
* [[DandiApplication.start]] or [[DandiApplication.run]] is invoked
* **Pre-Init** - Providers defined in [[DandiApplication]]'s options are registered with the internal
  provider repository; The application injector instance is created
* **Init** - The injector is initialized, and any scanners are run
* **Config** - Provided implementations of [[OnConfig]] are invoked
* **Bootstrap** - The [[EntryPoint]] implementation, if provided, is instantiated and invoked

### Application Startup and Bootstrapping

One of the [[DandiApplication.start]] or [[DandiApplication.run]] methods must be called to initialize
and start the application.

```typescript
import { DandiApplication } from '@dandi/core'

const app = new DandiApplication({
  providers: [
    MyService,
    MyInterfaceProvider,
  ],
})

app.run()
```

Startup logic is defined by providing an implementation of the [[EntryPoint]] interface:

```typescript
import { EntryPoint, DandiApplication, Inject, Injectable } from '@dandi/core'

@Injectable(EntryPoint)
class MyApp implements EntryPoint {

  constructor(
    @Inject(MyService) private myService: MyService,
  ) {}

  public run(): void {
    // start the app
    this.myService.listen()
  }

}

const app = new DandiApplication({
  providers: [
    MyApp,
    MyService,
    MyInterfaceProvider,
  ],
})

app.run()
```
