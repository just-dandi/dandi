import { Cache, CacheKeyGenerator } from '@dandi/cache'
import { Inject, Injectable, Singleton } from '@dandi/core'
import { AuthorizationService, AuthorizedUser } from '@dandi/mvc'
import * as admin from 'firebase-admin'
import { DateTime } from 'luxon'

import App = admin.app.App;
import Auth = admin.auth.Auth;
import UserRecord = admin.auth.UserRecord;

import { FirebaseServiceAccount } from './firebase.service.account'

const MILLIS_FACTOR = 1000

@Injectable(AuthorizationService('Bearer'), Singleton)
export class FirebaseAuthorizationService implements AuthorizationService {
  private readonly app: App;

  private get auth(): Auth {
    return this.app.auth()
  }

  constructor(
    @Inject(FirebaseServiceAccount) serviceAccount: FirebaseServiceAccount,
    @Inject(Cache) private cache: Cache,
    @Inject(CacheKeyGenerator) private cacheKey: CacheKeyGenerator,
  ) {
    this.app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    })
  }

  public async getAuthorizedUser(authorization: string): Promise<AuthorizedUser> {
    const tokenStr = authorization.substring(authorization.indexOf(' ') + 1)
    const userKey = this.cacheKey.keyFor(tokenStr)
    let user = await this.cache.get<UserRecord>(userKey)
    if (user) {
      return user
    }

    const token = await this.auth.verifyIdToken(tokenStr, true)
    const expires = DateTime.fromMillis(token.exp * MILLIS_FACTOR)
    user = await this.auth.getUser(token.uid)
    this.cache.set(userKey, user, expires.diffNow())
    return user
  }
}
