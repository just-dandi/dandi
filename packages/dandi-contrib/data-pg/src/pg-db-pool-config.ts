import { Inject, Injectable } from '@dandi/core'
import { DbConnectionInfo, DbUserCredentials } from '@dandi/data'
import { PoolConfig } from 'pg'

import { localToken } from './local-token'

export const PgDbConfig = localToken.opinionated<PoolConfig>('PoolConfig', {
  multi: false,
})

@Injectable(PgDbConfig)
export class PgDbPoolConfig implements PoolConfig {
  public readonly user: string
  public readonly password: string
  public readonly port: number
  public readonly host: string
  public readonly database: string

  constructor(
    @Inject(DbConnectionInfo) connectionInfo: DbConnectionInfo,
    @Inject(DbUserCredentials) credentials: DbUserCredentials,
  ) {
    Object.assign(this, connectionInfo)
    Object.assign(this, credentials)
    this.user = credentials.username
  }
}
