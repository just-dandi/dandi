import { InjectionToken, Provider } from '@dandi/core';

import { AuthorizationCondition } from './authorization.condition';
import { ConditionWithin } from './condition.within';
import { localOpinionatedToken } from './local.token';

export const CollectionResource = localOpinionatedToken<any[]>('CollectionResource', { multi: false });

export interface ConditionDecorators {
  within: ConditionWithin;
}

export type ConditionFactory = (...args: any[]) => AuthorizationCondition;

export class ConditionHelper {
  public static useFactory<TKey>(
    factory: ConditionFactory,
    deps: InjectionToken<any>[],
    ownedResource: Provider<TKey[]>,
    ...providers: Provider<any>[]
  ): Provider<AuthorizationCondition> {
    return {
      provide: AuthorizationCondition,
      useFactory: factory,
      deps: [...deps, CollectionResource],
      providers: [...providers, ownedResource],
    };
  }
}
