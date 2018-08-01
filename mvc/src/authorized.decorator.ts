import { isConstructor } from '@dandi/common';
import { Provider } from '@dandi/core';

import { AuthorizationCondition } from './authorization.condition';
import { AuthorizedUser } from './authorized.user';
import { getControllerMetadata } from './controller.metadata';

export function authorizedDecorator(
  conditions: Array<Provider<AuthorizationCondition>>,
  target: any,
  propertyKey: string,
) {
  const metaTarget = isConstructor(target) ? target : target.constructor;
  const meta = getControllerMetadata(metaTarget);

  if (propertyKey) {
    let controllerMethodMetadata = meta.routeMap.get(propertyKey);
    if (!controllerMethodMetadata) {
      controllerMethodMetadata = {};
      meta.routeMap.set(propertyKey, controllerMethodMetadata);
    }
    controllerMethodMetadata.authorization = conditions;
  } else {
    meta.authorization = conditions;
  }
}

export function Authorized(...conditions: Array<Provider<AuthorizationCondition>>) {
  return authorizedDecorator.bind(null, [IsAuthorized, ...conditions]);
}

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
