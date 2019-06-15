import { PgDbPool, PgDbPoolClient, poolClientFactory } from '@dandi-contrib/data-pg'

import { expect } from 'chai'
import { createStubInstance, stub } from 'sinon'

describe('poolClientFactory', function() {

  beforeEach(function() {
    this.pool = createStubInstance(PgDbPool)
  })

  it('calls connect() on the pool to create a client', async function() {

    const client = {}
    this.pool.connect.resolves(client)

    await poolClientFactory(this.pool)

    expect(this.pool.connect).to.have.been.calledOnce

  })

  it('returns an instance of PgDbPoolClient', async function() {

    const client = {}
    this.pool.connect.resolves(client)
    expect(await poolClientFactory(this.pool)).to.be.instanceof(PgDbPoolClient)

  })

})

describe('PgDbPoolClient', function() {

  beforeEach(function() {
    this.poolClient = {
      query: stub(),
      release: stub(),
    }
    this.client = new PgDbPoolClient(this.poolClient)
  })

  describe('query', function() {

    it('passes the cmd and args params through to the pg PoolClient instance', function() {

      const query = 'SELECT foo FROM bar WHERE id = $1'
      const args = ['1']
      this.client.query(query, args)

      expect(this.poolClient.query).to.have.been.calledOnceWithExactly(query, args)

    })

    it('returns the result from the pg PoolClient instance', async function() {

      const query = 'SELECT foo FROM bar WHERE id = $1'
      const args = ['1']
      const result = { id: 1 }
      this.poolClient.query.resolves(result)

      await expect(this.poolClient.query(query, args)).to.become(result)

    })

  })

  describe('dispose', function() {

    it('calls the release() function of the pg PoolClient instance', function() {

      this.client.dispose()

      expect(this.poolClient.release).to.have.been.calledOnce

    })

  })

})
