import { PgDbPoolClient } from '@dandi-contrib/data-pg'
import { Options, Provider } from '@dandi/core'
import { TestProvider } from '@dandi/core/testing'

import { QueryResult } from 'pg'
import { stub } from 'sinon'

export class PgDbPoolClientFixture implements PgDbPoolClient {

  public static result(result: Options<QueryResult> | Error): void {
    this.currentResult = result
  }

  public static throws(err: Error): void {
    this.currentResult = err
  }

  public static factory(singleton: boolean = true): TestProvider<PgDbPoolClient> {
    beforeEach(() => {
      this.result({ rows: [] })
    })
    return {
      provide: PgDbPoolClient,
      useFactory: () => new PgDbPoolClientFixture(),
      underTest: !singleton,
    }
  }

  private static currentResult: Options<QueryResult> | Error

  constructor() {
    stub(this, 'query').callsFake(() => {
      if (PgDbPoolClientFixture.currentResult instanceof Error) {
        return Promise.reject(PgDbPoolClientFixture.currentResult)
      }
      return Promise.resolve(PgDbPoolClientFixture.currentResult)
    })
    stub(this, 'dispose')
  }

  public query(cmd: string, args: any[]): Promise<QueryResult> {
    return undefined
  }

  public dispose(reason: string): void | Promise<void> {
    return undefined
  }

}
