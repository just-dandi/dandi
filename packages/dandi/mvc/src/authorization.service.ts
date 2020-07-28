import { MappedInjectionToken } from '@dandi/core'

import { AuthorizedUser } from './authorized-user'
import { localToken } from './local-token'

export interface AuthorizationService {
  getAuthorizedUser(authorization: string): Promise<AuthorizedUser>
}

const tokens = new Map<string, MappedInjectionToken<string, AuthorizationService>>()

export function AuthorizationService(key: string): MappedInjectionToken<string, AuthorizationService> {
  let token = tokens.get(key)
  if (!token) {
    token = {
      provide: localToken.opinionated<AuthorizationService>(`AuthorizationService:${key}`, { multi: false }),
      key,
    }
    tokens.set(key, token)
  }
  return token
}
