import { PgDbPool, poolClientFactory } from '@dandi-contrib/data-pg'
import { Disposable } from '@dandi/common'

import { expect } from 'chai'
import { createStubInstance, stub } from 'sinon'

describe('poolClientFactory', function() {

  beforeEach(function() {
    this.pool = createStubInstance(PgDbPool)
  })

  it('calls connect() on the pool to create a client', async function() {

    const client = {}
    this.pool.connect.resolves(client)

    expect(await poolClientFactory(this.pool)).to.equal(client)

  })

  it('returns the client directly if it is already a disposable', async function() {

    const client = {
      dispose: stub(),
    }
    const makeDisposable = stub(Disposable, 'makeDisposable')

    this.pool.connect.resolves(client)

    expect(await poolClientFactory(this.pool)).to.equal(client)
    expect(Disposable.makeDisposable).to.not.have.been.called

    makeDisposable.restore()

  })

  it('makes the client disposable by adding a dispose() function', async function() {

    const client: any = {
      release: stub(),
    }

    this.pool.connect.resolves(client)

    await poolClientFactory(this.pool)

    expect(client.dispose).to.be.a('function')

  })

  it(`the added dispose() function calls the client's release() function`, async function() {

    const client: any = {
      release: stub(),
    }
    this.pool.connect.resolves(client)

    await poolClientFactory(this.pool)

    await client.dispose()

    expect(client.release).to.have.been.called

  })

})
