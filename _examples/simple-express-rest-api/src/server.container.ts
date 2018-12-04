import { CascadingCache, MemoryCache, ServiceContextCacheKeyGenerator } from '@dandi/cache';
import { ConsoleLogger, Container, AmbientInjectableScanner } from '@dandi/core';
import { Validation } from '@dandi/model-builder';
import { ExpressMvcApplication } from '@dandi-contrib/mvc-express';
import { MvcHal } from '@dandi/mvc-hal';

import { ExampleController } from './example/example.controller';
import { ListController } from './lists/list.controller';
import { Db } from './shared/db';
import { TaskController } from './tasks/task.controller';

const DEFAULT_SERVER_PORT = 7080;

export const server = new Container({
  providers: [
    // DI
    AmbientInjectableScanner,
    ConsoleLogger,

    // MVC
    ExpressMvcApplication.defaults({ port: parseInt(process.env.PORT, 10) || DEFAULT_SERVER_PORT }),

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
  ],
});
