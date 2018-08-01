import { Provider } from '@dandi/core';

import { AuthorizationCondition } from './authorization.condition';

export interface AuthorizationMetadata {
  authorization?: Array<Provider<AuthorizationCondition>>;
}

export function mergeAuthorization(...args: AuthorizationMetadata[]): AuthorizationMetadata {
  if (!args.length) {
    return undefined;
  }

  const conditions = args.reduce((result, arg) => {
    if (arg.authorization) {
      arg.authorization.forEach((condition) => result.add(condition));
    }
    return result;
  }, new Set<Provider<AuthorizationCondition>>());

  return conditions.size
    ? {
        authorization: Array.from(conditions),
      }
    : undefined;
}
