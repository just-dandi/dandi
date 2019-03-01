import { CascadingCache, MemoryCache, ServiceContextCacheKeyGenerator } from '@dandi/cache'
import { AmbientInjectableScanner, Container } from '@dandi/core'
import { ConsoleLogListener, LoggingModule } from '@dandi/core/logging'
import { ModelBuilderModule } from '@dandi/model-builder'
import { MvcHalModule } from '@dandi/mvc-hal'
import { MvcViewModule } from '@dandi/mvc-view'
import { MvcExpressModule } from '@dandi-contrib/mvc-express'
import { EjsViewEngine } from '@dandi-contrib/mvc-view-ejs'
import { PugViewEngine } from '@dandi-contrib/mvc-view-pug'

import { ExampleController } from './example/example.controller'
import { ListController } from './lists/list.controller'
import { Db } from './shared/db'
import { TaskController } from './tasks/task.controller'
import { ViewController } from './view/view.controller'

const DEFAULT_SERVER_PORT = 7080

export const server = new Container({
  providers: [
    // DI
    AmbientInjectableScanner,
    LoggingModule.use(ConsoleLogListener),

    // MVC
    MvcExpressModule.config({ port: parseInt(process.env.PORT, 10) || DEFAULT_SERVER_PORT }),
    MvcViewModule
      .engine('pug', PugViewEngine)
      .engine('ejs', EjsViewEngine),
    MvcHalModule,

    // Model Validation
    ModelBuilderModule,

    // Cache
    CascadingCache,
    MemoryCache,
    ServiceContextCacheKeyGenerator,

    Db,

    // Controllers
    ListController,
    TaskController,
    ExampleController,
    ViewController,
  ],
})
