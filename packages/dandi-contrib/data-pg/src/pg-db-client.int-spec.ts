import { PgDbTestModel, pgTestDbHarness } from '@dandi-contrib/data-pg/testing'
import { Disposable } from '@dandi/common'
import { Inject, Injectable, RestrictScope } from '@dandi/core'
import { DbClient, DbQueryable } from '@dandi/data'
import { createHttpRequestScope, HttpRequestScope } from '@dandi/http'
import { expect } from 'chai'

describe.only('PgDbClient (integration)', () => {

  const harness = pgTestDbHarness()

  let client: DbClient

  async function simpleSelect(client: DbQueryable): Promise<PgDbTestModel> {
    return await client.queryModelSingle(PgDbTestModel, 'SELECT * FROM public.dandi_test')
  }

  async function simpleInsert(client: DbQueryable, data = 'test'): Promise<PgDbTestModel> {
    return await client.queryModelSingle(PgDbTestModel, `INSERT INTO public.dandi_test (data) VALUES ($1) RETURNING *`, data)
  }

  async function transactionInsert(client: DbClient): Promise<PgDbTestModel[]> {
    const insertResults = await client.transaction(async tran => {
      return Promise.all([
        await simpleInsert(tran, 'test1'),
        await simpleInsert(tran, 'test2'),
      ])
    })
    const selectResults = await client.queryModel(PgDbTestModel, `SELECT * FROM public.dandi_test`)
    expect(selectResults).to.include.deep.members(insertResults)
    return insertResults
  }

  beforeEach(async () => {
    client = await harness.inject(DbClient)
  })
  afterEach(() => {
    client = undefined
  })

  it('can execute a SELECT statement', async () => {
    await simpleSelect(client)
  })

  it('can execute an INSERT statement', async () => {
    await simpleInsert(client)
  })

  it('can execute statements within a transaction', async () => {
    await transactionInsert(client)
  })

  it('can use the client after committing a transaction', async () => {
    const results = await transactionInsert(client)
    expect(results).to.have.length(2)
  })

  it('can use the same client injected in two different places', async () => {
    const c1 = await harness.inject(DbClient)
    await transactionInsert(c1)
    const c2 = await harness.inject(DbClient)
    await transactionInsert(c2)
  })

  @Injectable(RestrictScope(HttpRequestScope))
  class TestContainer {
    constructor(@Inject(DbClient) public readonly dbClient: DbClient) {
    }
  }

  it('can use clients injected in two different scopes', async () => {
    const scope1 = harness.createChild(createHttpRequestScope({} as any), TestContainer)
    const c1 = await scope1.inject(DbClient)
    await transactionInsert(c1)
    await Disposable.dispose(scope1, 'test')

    const scope2 = harness.createChild(createHttpRequestScope({} as any), TestContainer)
    const c2 = await scope2.inject(DbClient)
    await transactionInsert(c2)
  })

})
