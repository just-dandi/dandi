import { CascadingCache, MemoryCache, ServiceContextCacheKeyGenerator } from '@dandi/cache';
import { ConsoleLogger, Container, AmbientInjectableScanner } from '@dandi/core';
import { Validation } from '@dandi/model-builder';
import { MvcHal } from '@dandi/mvc-hal';
import { MvcViewModule } from '@dandi/mvc-view';

import { MvcViewPugModule } from '@dandi-contrib/mvc-view-pug';
import { ExpressMvcApplication } from '@dandi-contrib/mvc-express';

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
    ExpressMvcApplication.defaults({ port: parseInt(process.env.PORT, 10) || DEFAULT_SERVER_PORT }),
    MvcViewModule,
    MvcViewPugModule,

    // Model Validation
    Validation,

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
