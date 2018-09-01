import { InjectionToken } from '@dandi/core';

import { ControllerResult } from './controller.result';
import { localOpinionatedToken } from './local.token';

export interface ControllerResultTransformer {
  transform(result: ControllerResult): Promise<ControllerResult>;
}

export const ControllerResultTransformer: InjectionToken<ControllerResultTransformer> = localOpinionatedToken(
  'ControllerResultTransformer',
  {
    multi: true,
  },
);
