import { PgDbPoolClient } from '@dandi-contrib/data-pg'
import { TestProvider } from '@dandi/core/testing'

import { QueryResult } from 'pg'
import { stub } from 'sinon'

export class PgDbPoolClientFixture extends PgDbPoolClient {

  public static result(result: Partial<QueryResult> | Error): void {
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
      singleton,
      underTest: !singleton,
    }
  }

  private static currentResult: Partial<QueryResult> | Error

  constructor() {
    super(undefined)
    stub(this, 'query').callsFake(() => {
      if (PgDbPoolClientFixture.currentResult instanceof Error) {
        return Promise.reject(PgDbPoolClientFixture.currentResult)
      }
      return Promise.resolve(PgDbPoolClientFixture.currentResult)
    })
    stub(this, 'dispose')
  }

}
