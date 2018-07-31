import { InjectionToken, OpinionatedToken } from '@dandi/core';
import { Express } from 'express';

export const ExpressInstance: InjectionToken<Express> = OpinionatedToken.local<
  Express
>('express', 'Express', { multi: false, singleton: true });
