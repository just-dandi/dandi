import { ModuleBuilder, Registerable } from '@dandi/core'

import { FirebaseAuthorizationService } from './firebase.authorization.service'
import { PKG } from './local.token'

export class MvcAuthFirebaseModuleBuilder extends ModuleBuilder<MvcAuthFirebaseModuleBuilder> {
  constructor(...entries: Registerable[]) {
    super(MvcAuthFirebaseModuleBuilder, PKG, ...entries)
  }
}

export const MvcAuthFirebaseModule = new MvcAuthFirebaseModuleBuilder(FirebaseAuthorizationService)
