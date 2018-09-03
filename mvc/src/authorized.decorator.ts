import { isConstructor, MethodTarget } from '@dandi/common';
import { Provider } from '@dandi/core';

import { AuthorizationCondition } from './authorization.condition';
import { AuthorizedUser } from './authorized.user';
import { ControllerMetadata, ControllerMethodMetadata, getControllerMetadata } from './controller.metadata';

export type AuthorizedConditionFactory = <T>(
  target: Object,
  propertyKey: string | symbol,
) => Provider<AuthorizationCondition>;

export interface AuthorizationMetadata {
  controllerMetadata: ControllerMetadata;
  methodMetadata?: ControllerMethodMetadata;
}

export function initAuthorizationMetadata(target: MethodTarget<any>, propertyKey: string | symbol) {
  const metaTarget = isConstructor(target) ? target : target.constructor;
  const controllerMetadata = getControllerMetadata(metaTarget);

  if (propertyKey) {
    let methodMetadata = controllerMetadata.routeMap.get(propertyKey);
    if (!methodMetadata) {
      methodMetadata = {};
      controllerMetadata.routeMap.set(propertyKey, methodMetadata);
    }
    if (!methodMetadata.authorization) {
      methodMetadata.authorization = [];
    }
    return {
      methodMetadata,
      controllerMetadata,
    };
  }
  if (!controllerMetadata.authorization) {
    controllerMetadata.authorization = [];
  }
  return {
    controllerMetadata,
  };
}

export function authorizedDecorator<T>(
  conditions: Provider<AuthorizationCondition>[],
  target: any,
  propertyKey: string,
) {
  const meta = initAuthorizationMetadata(target, propertyKey);

  if (propertyKey) {
    meta.methodMetadata.authorization.push(...conditions);
  } else {
    meta.controllerMetadata.authorization.push(...conditions);
  }
}

export interface AuthorizedDecorator {
  (...conditions: Provider<AuthorizationCondition>[]);
}

const Authorized: AuthorizedDecorator = function(...conditions: Provider<AuthorizationCondition>[]) {
  return authorizedDecorator.bind(null, [IsAuthorized, ...conditions]);
} as any;

export { Authorized };

export function isAuthorizedFactory(authUser): AuthorizationCondition {
  if (authUser) {
    return {
      allowed: true,
    };
  }
  return {
    allowed: false,
    reason: 'Not Authorized',
  };
}

export const IsAuthorized: Provider<AuthorizationCondition> = {
  provide: AuthorizationCondition,
  useFactory: isAuthorizedFactory,
  deps: [AuthorizedUser],
};
