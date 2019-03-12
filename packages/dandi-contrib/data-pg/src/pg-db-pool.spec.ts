import { PgDbPool } from '@dandi-contrib/data-pg'
import { AlreadyDisposedError, Disposable } from '@dandi/common'

import { expect } from 'chai'
import { stub } from 'sinon'

describe('PgDbPool', function() {

  beforeEach(function() {
    this.config = { host: 'test' }
    this.pool = new PgDbPool(this.config)

    stub(this.pool.pool, 'connect')
    this.end = stub(this.pool.pool, 'end')
    stub(this.pool.pool, 'query')
  })

  describe('ctr', function() {

    it('creates a new pg Pool instance, passing the specified config object', function() {

      expect(this.pool.pool).to.exist

      // pg actually gives you a "BoundPool" instance, but it's not exposed on the public API,
      // so we can't use instanceof to check the type.
      this.pool.pool.connect.restore()
      this.pool.pool.end.restore()
      this.pool.pool.query.restore()

      expect(this.pool.pool.connect).to.be.a('function')
      expect(this.pool.pool.end).to.be.a('function')
      expect(this.pool.pool.query).to.be.a('function')

    })

  })

  describe('connect', function() {
    it('calls through to the pg Pool instance', async function() {
      await this.pool.connect()

      expect(this.pool.pool.connect).to.have.been.calledOnce
    })
  })

  describe('query', function() {
    it('calls through to the pg Pool instance', async function() {
      await this.pool.query('SELECT foo FROM bar WHERE id = $1', [42])

      expect(this.pool.pool.query).to.have.been
        .calledOnce
        .calledWithExactly('SELECT foo FROM bar WHERE id = $1', [42])
    })
  })

  describe('dispose', function() {

    it(`calls the pg Pool instance's end method`, async function() {
      await this.pool.dispose()
      expect(this.end).to.have.been.calledOnce
    })

    it('marks the instance as disposed', async function() {
      await this.pool.dispose()
      expect(Disposable.isDisposed(this.pool)).to.be.true
    })

    it('throws an error when attempting to use the pool after being disposed', async function() {
      await this.pool.dispose()
      await expect(() => this.pool.connect()).to.throw(AlreadyDisposedError)
    })

  })


})
