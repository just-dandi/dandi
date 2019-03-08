import { PgDbPoolClient, PgDbTransactionClient, TransactionRollbackError } from '@dandi-contrib/data-pg'
import { stubHarness } from '@dandi/core/testing'
import { ModelBuilder } from '@dandi/model-builder'

import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('PgDbTransactionClient', function() {

  const harness = stubHarness(PgDbTransactionClient,
    {
      provide: PgDbPoolClient,
      useFactory: () => ({
        query: stub().returns({ rows: [] }),
        release: stub(),
        dispose: stub(),
      }),
    },
    {
      provide: ModelBuilder,
      useFactory: () => ({
        constructMember: stub(),
        constructModel: stub(),
      }),
    },
  )

  beforeEach(async function() {
    this.client = await harness.inject(PgDbPoolClient)
    this.transactionClient = await harness.inject(PgDbTransactionClient)
  })

  describe('query', function() {
    beforeEach(function() {
      stub(this.transactionClient, 'rollback')
    })

    xit('begins the transaction if it has not already begun and sets the internal state to BEGIN', async function() {
      expect((this.transactionClient as any).state).to.be.undefined

      await this.transactionClient.query('SELECT foo FROM bar')

      expect((this.transactionClient as any).state).to.equal('BEGIN')
      expect(this.client.query).to.have.been.calledTwice
      expect(this.client.query.firstCall.args).to.deep.equal(['BEGIN', undefined])
      expect(this.client.query.secondCall.args).to.deep.equal(['SELECT foo FROM bar', undefined])
    })

    xit('does not send additional BEGIN queries if the transaction has already begun', async function() {
      await this.transactionClient.query('INSERT INTO bar (foo) VALUES ($1)', [42])
      await this.transactionClient.query('SELECT foo FROM bar')

      expect(this.client.query).to.have.been.calledThrice
      expect(this.client.query.firstCall.args).to.deep.equal(['BEGIN', undefined])
      expect(this.client.query.secondCall.args).to.deep.equal(['INSERT INTO bar (foo) VALUES ($1)', [42]])
      expect(this.client.query.thirdCall.args).to.deep.equal(['SELECT foo FROM bar', undefined])
    })

    xit('rolls the transaction back if an exception is thrown and rethrows the error', async function() {
      const catcher = stub()
      this.client.query.onSecondCall().callsFake(() => {
        throw new Error()
      })
      this.client.query.onThirdCall().returns({ rows: [] })

      try {
        await this.transactionClient.query('SELECT foo FROM bar')
      } catch (err) {
        catcher(err)
      }
      expect(catcher).to.have.been.calledOnce
      expect(this.client.query).to.have.been.calledTwice
      expect(this.client.query.firstCall.args).to.deep.equal(['BEGIN'])
      expect(this.client.query.secondCall.args).to.deep.equal(['SELECT foo FROM bar', undefined])
      expect(this.transactionClient.rollback).to.have.been.calledOnce
    })
  })

  describe('commit', function() {

    beforeEach(function() {
      stub(this.transactionClient, 'rollback')
    })

    it('commits the transaction and sets the internal state to COMMIT', async function() {
      await this.transactionClient.commit()

      expect((this.transactionClient as any).state).to.equal('COMMIT')
      expect(this.client.query).to.have.been.calledOnce
      expect(this.client.query).to.have.been.calledWith('COMMIT')
      expect(this.transactionClient.rollback).not.to.have.been.called
    })

    xit('rolls back the transaction if an error is thrown', async function() {
      const err = new Error()
      this.client.query.callsFake(() => {
        throw err
      })

      await this.transactionClient.commit()

      expect(this.client.query).to.have.been.calledOnce
      expect(this.client.query).to.have.been.calledWith('COMMIT')
      expect(this.transactionClient.rollback).to.have.been.calledOnce
      expect(this.transactionClient.rollback).to.have.been.calledWith(err)
    })
  })

  describe('rollback', function() {
    it('attempts to rollback the transaction and sets the internal state to ROLLBACK', async function() {
      await this.transactionClient.rollback()

      expect((this.transactionClient as any).state).to.equal('ROLLBACK')
      expect(this.client.query).to.have.been.calledOnce
      expect(this.client.query).to.have.been.calledWith('ROLLBACK')
    })

    it('rethrows an error if specified', async function() {
      const err = new Error()

      await expect(this.transactionClient.rollback(err)).to.be.rejectedWith(err)
    })

    xit('throws a TransactionRollbackError if an error occurs during the rollback', async function() {
      const rollbackError = new Error()
      this.client.query.callsFake(() => {
        throw rollbackError
      })

      const rollbackResultError = await expect(this.transactionClient.rollback()).to.be.rejectedWith(
        TransactionRollbackError,
      )
      expect(rollbackResultError.innerError).to.equal(rollbackError)
    })

    it('includes the original query error in the TransactionRollbackError if specified', async function() {
      const rollbackError = new Error()
      const originalError = new Error()
      this.client.query.callsFake(() => {
        throw rollbackError
      })

      const rollbackResultError = await expect(this.transactionClient.rollback(originalError)).to.be.rejectedWith(
        TransactionRollbackError,
      )
      expect(rollbackResultError.originalError).to.equal(originalError)
    })
  })

  describe('dispose', function() {
    beforeEach(function() {
      stub(this.transactionClient, 'commit')
    })

    xit('calls release() on the pg PoolClient', async function() {
      await this.transactionClient.dispose('')

      expect(this.client.release).to.have.been.calledOnce
    })

    xit('attempts to commit the transaction if it has begun', async function() {
      (this.transactionClient as any).state = 'BEGIN'

      await this.transactionClient.dispose('')

      expect(this.transactionClient.commit).to.have.been.calledOnce.calledBefore(this.client.release)
    })

    xit('does not attempt to commit the transaction if it has already been committed', async function() {
      (this.transactionClient as any).state = 'COMMIT'

      await this.transactionClient.dispose('')

      expect(this.transactionClient.commit).not.to.have.been.called
    })

    xit('releases the client even if an error is thrown, and rethrows the error', async function() {
      (this.transactionClient as any).state = 'BEGIN'
      const err = new Error();
      (this.transactionClient.commit as SinonStub).callsFake(() => {
        throw err
      })

      await expect(this.transactionClient.dispose('')).to.be.rejectedWith(err)
      expect(this.client.release).to.have.been.calledOnce
    })
  })
})
