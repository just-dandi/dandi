import { Inject, Injectable, OpinionatedToken, InjectionToken } from '@dandi/core';
import { DbConnectionInfo, DbUserCredentials } from '@dandi/data';
import { PoolConfig } from 'pg';

export const PgDbConfig: InjectionToken<PoolConfig> = OpinionatedToken.local<PoolConfig>('pg', 'PoolConfig', {
    singleton: true,
    multi:     false,
});

@Injectable(PgDbConfig)
export class PgDbPoolConfig implements PoolConfig {

    constructor(
        @Inject(DbConnectionInfo) connectionInfo: DbConnectionInfo,
        @Inject(DbUserCredentials) credentials: DbUserCredentials,
    ) {
        Object.assign(this, connectionInfo);
        Object.assign(this, credentials);
        this.user = credentials.username;
    }

    public readonly user: string;
    public readonly password: string;
    public readonly port: number;
    public readonly host: string;
    public readonly database: string;

}
