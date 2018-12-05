import { CascadingCache, MemoryCache, ServiceContextCacheKeyGenerator } from '@dandi/cache';
import { ConsoleLogger, Container, AmbientInjectableScanner } from '@dandi/core';
import { ModelBuilderModule } from '@dandi/model-builder';
import { MvcHal } from '@dandi/mvc-hal';
import { MvcViewModule } from '@dandi/mvc-view';

import { MvcExpressModule } from '@dandi-contrib/mvc-express';
import { PugViewEngine } from '@dandi-contrib/mvc-view-pug';

import { ExampleController } from './example/example.controller';
import { ListController } from './lists/list.controller';
import { Db } from './shared/db';
import { TaskController } from './tasks/task.controller';
import { ViewController } from './view/view.controller';

const DEFAULT_SERVER_PORT = 7080;

export const server = new Container({
  providers: [
    // DI
    AmbientInjectableScanner,
    ConsoleLogger,

    // MVC
    MvcExpressModule.withDefaults().config({ port: parseInt(process.env.PORT, 10) || DEFAULT_SERVER_PORT }),
    MvcViewModule.engine('pug', PugViewEngine),

    // Model Validation
    ModelBuilderModule,

    // Cache
    CascadingCache,
    MemoryCache,
    ServiceContextCacheKeyGenerator,

    MvcHal,
    Db,

    // Controllers
    ListController,
    TaskController,
    ExampleController,
    ViewController,
  ],
});
