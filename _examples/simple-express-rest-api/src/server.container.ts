import { CascadingCache, MemoryCache, ServiceContextCacheKeyGenerator } from '@dandi/cache';
import { ConsoleLogger, Container, AmbientInjectableScanner } from '@dandi/core';
import { Validation } from '@dandi/model-validation';
import { ExpressMvcApplication } from '@dandi/mvc-express';

import { DataController } from './data/data.controller';

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

    // Controllers
    DataController,
  ],
});
