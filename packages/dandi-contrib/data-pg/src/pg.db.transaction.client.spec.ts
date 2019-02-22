import { Disposable } from '@dandi/common'
import { Logger, NoopLogger } from '@dandi/core'
import { ModelBuilder } from '@dandi/model-builder'
import { PoolClient } from 'pg'
import { expect } from 'chai'
import { SinonStub, SinonStubbedInstance, createStubInstance, stub } from 'sinon'

import { PgDbTransactionClient, TransactionRollbackError } from './pg.db.transaction.client'

describe('PgDbTransactionClient', () => {
  let client: Disposable & SinonStubbedInstance<PoolClient>
  let modelValidator: ModelBuilder
  let logger: SinonStubbedInstance<Logger>
  let transactionClient: PgDbTransactionClient

  beforeEach(() => {
    client = {
      query: stub().returns({ rows: [] }),
      release: stub(),
      dispose: stub(),
    } as any
    modelValidator = {
      constructMember: stub(),
      constructModel: stub(),
    }
    logger = createStubInstance(NoopLogger)
    // @ts-ignore
    transactionClient = new PgDbTransactionClient(client, modelValidator, logger)
  })
  afterEach(() => {
    client = undefined
    modelValidator = undefined
    logger = undefined
    transactionClient = undefined
  })

  describe('query', () => {
    beforeEach(() => {
      stub(transactionClient, 'rollback')
    })

    xit('begins the transaction if it has not already begun and sets the internal state to BEGIN', async () => {
      expect((transactionClient as any).state).to.be.undefined

      await transactionClient.query('SELECT foo FROM bar')

      expect((transactionClient as any).state).to.equal('BEGIN')
      expect(client.query).to.have.been.calledTwice
      expect(client.query.firstCall.args).to.deep.equal(['BEGIN', undefined])
      expect(client.query.secondCall.args).to.deep.equal(['SELECT foo FROM bar', undefined])
    })

    xit('does not send additional BEGIN queries if the transaction has already begun', async () => {
      await transactionClient.query('INSERT INTO bar (foo) VALUES ($1)', [42])
      await transactionClient.query('SELECT foo FROM bar')

      expect(client.query).to.have.been.calledThrice
      expect(client.query.firstCall.args).to.deep.equal(['BEGIN', undefined])
      expect(client.query.secondCall.args).to.deep.equal(['INSERT INTO bar (foo) VALUES ($1)', [42]])
      expect(client.query.thirdCall.args).to.deep.equal(['SELECT foo FROM bar', undefined])
    })

    xit('rolls the transaction back if an exception is thrown and rethrows the error', async () => {
      const catcher = stub()
      client.query.onSecondCall().callsFake(() => {
        throw new Error()
      })
      client.query.onThirdCall().returns({ rows: [] })

      try {
        await transactionClient.query('SELECT foo FROM bar')
      } catch (err) {
        catcher(err)
      }
      expect(catcher).to.have.been.calledOnce
      expect(client.query).to.have.been.calledTwice
      expect(client.query.firstCall.args).to.deep.equal(['BEGIN'])
      expect(client.query.secondCall.args).to.deep.equal(['SELECT foo FROM bar', undefined])
      expect(transactionClient.rollback).to.have.been.calledOnce
    })
  })

  describe('commit', () => {
    beforeEach(() => {
      stub(transactionClient, 'rollback')
    })

    it('commits the transaction and sets the internal state to COMMIT', async () => {
      await transactionClient.commit()

      expect((transactionClient as any).state).to.equal('COMMIT')
      expect(client.query).to.have.been.calledOnce
      expect(client.query).to.have.been.calledWith('COMMIT')
      expect(transactionClient.rollback).not.to.have.been.called
    })

    xit('rolls back the transaction if an error is thrown', async () => {
      const err = new Error()
      client.query.callsFake(() => {
        throw err
      })

      await transactionClient.commit()

      expect(client.query).to.have.been.calledOnce
      expect(client.query).to.have.been.calledWith('COMMIT')
      expect(transactionClient.rollback).to.have.been.calledOnce
      expect(transactionClient.rollback).to.have.been.calledWith(err)
    })
  })

  describe('rollback', () => {
    it('attempts to rollback the transaction and sets the internal state to ROLLBACK', async () => {
      await transactionClient.rollback()

      expect((transactionClient as any).state).to.equal('ROLLBACK')
      expect(client.query).to.have.been.calledOnce
      expect(client.query).to.have.been.calledWith('ROLLBACK')
    })

    it('rethrows an error if specified', async () => {
      const err = new Error()

      await expect(transactionClient.rollback(err)).to.be.rejectedWith(err)
    })

    xit('throws a TransactionRollbackError if an error occurs during the rollback', async () => {
      const rollbackError = new Error()
      client.query.callsFake(() => {
        throw rollbackError
      })

      const rollbackResultError = await expect(transactionClient.rollback()).to.be.rejectedWith(
        TransactionRollbackError,
      )
      expect(rollbackResultError.innerError).to.equal(rollbackError)
    })

    it('includes the original query error in the TransactionRollbackError if specified', async () => {
      const rollbackError = new Error()
      const originalError = new Error()
      client.query.callsFake(() => {
        throw rollbackError
      })

      const rollbackResultError = await expect(transactionClient.rollback(originalError)).to.be.rejectedWith(
        TransactionRollbackError,
      )
      expect(rollbackResultError.originalError).to.equal(originalError)
    })
  })

  describe('dispose', () => {
    beforeEach(() => {
      stub(transactionClient, 'commit')
    })

    xit('calls release() on the pg PoolClient', async () => {
      await transactionClient.dispose('')

      expect(client.release).to.have.been.calledOnce
    })

    it('attempts to commit the transaction if it has begun', async () => {
      (transactionClient as any).state = 'BEGIN'

      await transactionClient.dispose('')

      expect(transactionClient.commit).to.have.been.calledOnce.calledBefore(client.release)
    })

    it('does not attempt to commit the transaction if it has already been committed', async () => {
      (transactionClient as any).state = 'COMMIT'

      await transactionClient.dispose('')

      expect(transactionClient.commit).not.to.have.been.called
    })

    xit('releases the client even if an error is thrown, and rethrows the error', async () => {
      (transactionClient as any).state = 'BEGIN'
      const err = new Error();
      (transactionClient.commit as SinonStub).callsFake(() => {
        throw err
      })

      await expect(transactionClient.dispose('')).to.be.rejectedWith(err)
      expect(client.release).to.have.been.calledOnce
    })
  })
})
