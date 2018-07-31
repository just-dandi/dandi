import { Provider } from '@dandi/core';

import { AuthorizationCondition } from './authorization.condition';

export interface AuthorizationMetadata {
  authorization?: false | Array<Provider<AuthorizationCondition>>;
}

export function mergeAuthorization(
  ...args: AuthorizationMetadata[]
): AuthorizationMetadata {
  if (!args.length) {
    return null;
  }
  if (args.length === 1) {
    return args[0];
  }
  const first = args[0];

  // make a copy so we don't modify any thing from Reflection
  const init: AuthorizationMetadata = {
    authorization: first.authorization ? first.authorization.slice(0) : false,
  };
  return args.slice(1).reduce((result, meta) => {
    if (!meta.authorization) {
      return result;
    }
    result.authorization = result.authorization
      ? result.authorization.concat(meta.authorization)
      : meta.authorization.slice(0);
    return result;
  }, init);
}
