import { ModuleBuilder, Registerable } from '@dandi/core'

import { FirebaseAuthorizationService } from './firebase-authorization-service'
import { localToken } from './local-token'

export class MvcAuthFirebaseModuleBuilder extends ModuleBuilder<MvcAuthFirebaseModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(MvcAuthFirebaseModuleBuilder, localToken.PKG, entries)
  }
}

export const MvcAuthFirebaseModule = new MvcAuthFirebaseModuleBuilder(FirebaseAuthorizationService)
