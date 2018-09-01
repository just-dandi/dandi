import { Constructor } from '@dandi/common';
import { InjectionToken, MappedInjectionToken } from '@dandi/core';

import { ComposedResource } from './composed.resource';
import { CompositionContext } from './composition.context';
import { localOpinionatedToken } from './local.token';

const composerTokens: Map<Constructor<any>, MappedInjectionToken<Constructor<any>, any>> = new Map<
  Constructor<any>,
  MappedInjectionToken<Constructor<any>, any>
>();

export interface ResourceComposer {
  compose<T>(resource: T, parentContext: CompositionContext): Promise<ComposedResource<T>>;
}

// function ResourceComposer(resourceType: Constructor<any>) {
//   let token = composerTokens.get(resourceType);
//   if (!token) {
//     token = {
//       provide: localOpinionatedToken(`ResourceComposer:${resourceType.name}`, { multi: false }),
//       key: resourceType,
//     };
//     composerTokens.set(resourceType, token);
//   }
//   return token;
// }
// export { ResourceComposer };
export const ResourceComposer: InjectionToken<ResourceComposer> = localOpinionatedToken('ResourceComposer', {
  multi: false,
});
