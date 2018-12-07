import { ModelBuilder } from '@dandi/model-builder'
import { expect } from 'chai'
import { SinonStubbedInstance, stub } from 'sinon'

import { PgDbQueryableBase, PgDbQueryableClient } from './pg.db.queryable'

describe('PgDbQueryableBase', () => {
  let client: SinonStubbedInstance<PgDbQueryableClient>
  let queryable: PgDbQueryableBase<PgDbQueryableClient>
  let modelValidator: ModelBuilder
  let clientResult: any

  beforeEach(() => {
    clientResult = { rows: [{ id: 'a' }, { id: 'b' }] }
    client = {
      query: stub().returns(clientResult),
    }
    modelValidator = {
      constructMember: stub(),
      constructModel: stub(),
    }
    queryable = new PgDbQueryableBase<PgDbQueryableClient>(client, modelValidator)
  })
  afterEach(() => {
    client = undefined
    modelValidator = undefined
    queryable = undefined
  })

  describe('query', () => {
    it('passes the cmd and args arguments to the client', async () => {
      const cmd = 'SELECT foo FROM bar WHERE ix = $1'
      const args = 'nay'

      await queryable.query(cmd, args)

      expect(client.query).to.have.been.calledWithExactly(cmd, [args])
    })
  })
})
