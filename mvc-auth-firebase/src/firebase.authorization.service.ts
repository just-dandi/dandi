import { Cache, CacheKeyGenerator }             from '@dandi/cache';
import { DateTime }                             from '@dandi/core';
import { Inject, Injectable, Singleton }        from '@dandi/di-core';
import { AuthorizationService, AuthorizedUser } from '@dandi/mvc';

import * as admin from 'firebase-admin';
import App = admin.app.App;
import Auth = admin.auth.Auth;
import UserRecord = admin.auth.UserRecord;

import { FirebaseServiceAccount } from './firebase.service.account';

@Injectable(AuthorizationService('Bearer'), Singleton)
export class FirebaseAuthorizationService implements AuthorizationService {

    private readonly app: App;

    private get auth(): Auth {
        return this.app.auth();
    }

    constructor(
        @Inject(FirebaseServiceAccount) serviceAccount: FirebaseServiceAccount,
        @Inject(Cache) private cache: Cache,
        @Inject(CacheKeyGenerator) private cacheKey: CacheKeyGenerator,
    ) {
        this.app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    }

    public async getAuthorizedUser(authorization: string): Promise<AuthorizedUser> {
        const tokenStr = authorization.substring(authorization.indexOf(' ') + 1);
        const userKey = this.cacheKey.keyFor(tokenStr);
        let user = await this.cache.get<UserRecord>(userKey);
        if (user) {
            return user;
        }

        const token = await this.auth.verifyIdToken(tokenStr, true);
        const expires = DateTime.fromMillis(token.exp * 1000);
        user = await this.auth.getUser(token.uid);
        this.cache.set(userKey, user, expires.diffNow());
        return user;
    }

}
