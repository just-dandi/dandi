import { Provider } from '@dandi/core';
import { Express } from 'express';
import * as express from 'express';

import { ExpressInstance } from './tokens';

export const DEFAULT_EXPRESS_PROVIDER: Provider<Express> = {
  provide: ExpressInstance,
  useFactory: () => {
    return express();
  },
};
