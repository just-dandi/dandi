import { MvcExpressModule } from '@dandi-contrib/mvc-express'
import { EjsViewEngine } from '@dandi-contrib/mvc-view-ejs'
import { HyperviewViewRenderer } from '@dandi-contrib/mvc-view-hyperview'
import { PugViewEngine } from '@dandi-contrib/mvc-view-pug'
import { CascadingCache, MemoryCache, ServiceContextCacheKeyGenerator } from '@dandi/cache'
import { AmbientInjectableScanner, DandiApplication } from '@dandi/core'
import { ConsoleLogListener, LoggingModule } from '@dandi/core/logging'
import { HttpPipelineModule } from '@dandi/http-pipeline'
import { ModelBuilderModule } from '@dandi/model-builder'
import { MvcHalModule } from '@dandi/mvc-hal'
import { MvcViewModule } from '@dandi/mvc-view'

import { CustomErrorHandler } from './custom-error-handler'
import { ExampleController } from './example/example.controller'
import { HyperviewController } from './hyperview/hyperview.controller'
import { ListController } from './lists/list.controller'
import { Db } from './shared/db'
import { TaskController } from './tasks/task.controller'
import { ViewController } from './view/view.controller'

const DEFAULT_SERVER_PORT = 8085

export const server = new DandiApplication({
  providers: [
    AmbientInjectableScanner,

    // Logging
    LoggingModule.use(ConsoleLogListener),

    // MVC
    HttpPipelineModule.cors({
      allowOrigin: [/localhost:\d{2,5}/, /127\.0\.0\1:\d{2,5}/],
    }),
    MvcExpressModule.config({ port: parseInt(process.env.PORT, 10) || DEFAULT_SERVER_PORT }),
    MvcViewModule.engine('ejs', EjsViewEngine.config({ cache: false })).engine(
      'pug',
      PugViewEngine.config({ cache: false }),
    ),
    MvcHalModule,
    HyperviewViewRenderer,
    CustomErrorHandler,

    // Model Validation
    ModelBuilderModule,

    // Cache
    CascadingCache,
    MemoryCache,
    ServiceContextCacheKeyGenerator,

    Db,

    // Controllers
    HyperviewController,
    ListController,
    TaskController,
    ExampleController,
    ViewController,
  ],
})
