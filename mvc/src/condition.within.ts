import { MethodTarget } from '@dandi/common';
import { Provider } from '@dandi/core';

import { initAuthorizationMetadata } from './authorized.decorator';
import { AuthorizationCondition } from './authorization.condition';
import { ConditionFactory, ConditionHelper } from './condition.decorator';
import { RequestParamDecorator } from './request.param.decorator';

export type SelectorFn<T, TKey> = (obj: T) => TKey;

export interface ConditionWithin {
  (collection: Provider<any[]>): ParameterDecorator;
}

function checkWithinByKey<T>(key: T, ownedResource: T[]): AuthorizationCondition {
  if (ownedResource.includes(key)) {
    return {
      allowed: true,
    };
  }
  return {
    allowed: false,
    reason: 'The current user does not have access the requested resource',
  };
}

function checkWithinBySource<T, TKey>(selectorFn: SelectorFn<T, TKey>, source, ownedResource) {
  const key = selectorFn(source);
  return checkWithinByKey(key, ownedResource);
}

function conditionDecorator<T>(
  conditionFactory: ConditionFactory,
  decorator: RequestParamDecorator<T>,
  collection: Provider<any[]>,
  target: MethodTarget<any>,
  propertyKey: string | symbol,
  paramIndex: number,
) {
  const result = decorator(target, propertyKey, paramIndex);
  const meta = initAuthorizationMetadata(target, propertyKey);
  meta.methodMetadata.authorization.push(ConditionHelper.useFactory(conditionFactory, [result.meta.token], collection));
}

export function conditionWithinByKeyDecorator<T>(decorator: RequestParamDecorator<T>, collection: Provider<any[]>) {
  return conditionDecorator.bind(null, checkWithinByKey, decorator, collection);
}

export function conditionWithinBySourceDecorator<T, TKey>(
  decorator: RequestParamDecorator<T>,
  collection: Provider<any[]>,
  selectorFn: SelectorFn<T, TKey>,
) {
  return conditionDecorator.bind(null, checkWithinBySource.bind(null, selectorFn), decorator, collection);
}
