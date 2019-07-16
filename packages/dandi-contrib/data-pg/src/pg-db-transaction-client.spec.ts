import {
  InvalidTransactionStateError,
  PgDbPoolClient,
  PgDbQueryError,
  PgDbTransactionClient,
  TransactionRollbackError,
} from '@dandi-contrib/data-pg'
import { PgDbPoolClientFixture } from '@dandi-contrib/data-pg/testing'
import { stubHarness } from '@dandi/core/testing'
import { ModelBuilderFixture } from '@dandi/model-builder/testing'

import { expect } from 'chai'
import { stub } from 'sinon'

describe('PgDbTransactionClient', function() {

  const harness = stubHarness(PgDbTransactionClient,
    PgDbPoolClientFixture.factory(),
    ModelBuilderFixture.factory,
  )

  beforeEach(async function() {
    this.client = await harness.inject(PgDbPoolClient)
    this.transactionClient = await harness.inject(PgDbTransactionClient)
    let transactionState = this.transactionClient.state
    this.state = stub()
    stub(this.transactionClient, 'state')
      .get(() => transactionState)
      .set(state => {
        transactionState = state
        this.state(state)
      })
  })

  it('initializes the client in the IDLE state', function() {
    expect(this.transactionClient.state).to.equal('IDLE')
  })

  describe('transactionQuery', function() {
    beforeEach(function() {
      stub(this.transactionClient, 'rollback')
    })

    it('begins the transaction if it has not already begun and sets the internal state to READY', async function() {

      await this.transactionClient.query('SELECT foo FROM bar')

      expect(this.transactionClient.state).to.equal('READY')
      expect(this.client.query).to.have.been.calledTwice
      expect(this.client.query.firstCall.args).to.deep.equal(['BEGIN', []])
      expect(this.client.query.secondCall.args).to.deep.equal(['SELECT foo FROM bar', []])
    })

    it('does not send additional BEGIN queries if the transaction has already begun', async function() {
      await this.transactionClient.query('INSERT INTO bar (foo) VALUES ($1)', 42)
      await this.transactionClient.query('SELECT foo FROM bar')

      expect(this.client.query).to.have.been.calledThrice
      expect(this.client.query.firstCall.args).to.deep.equal(['BEGIN', []])
      expect(this.client.query.secondCall.args).to.deep.equal(['INSERT INTO bar (foo) VALUES ($1)', [42]])
      expect(this.client.query.thirdCall.args).to.deep.equal(['SELECT foo FROM bar', []])
    })

    it('rolls the transaction back if an exception is thrown and rethrows the error', async function() {
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
      expect(this.client.query.firstCall.args).to.deep.equal(['BEGIN', []])
      expect(this.client.query.secondCall.args).to.deep.equal(['SELECT foo FROM bar', []])
      expect(this.transactionClient.rollback).to.have.been.calledOnce
    })

    it('waits for an existing state transition before continuing', async function() {

      this.transactionClient.query('SELECT foo FROM bar')
      const secondQuery = this.transactionClient.query('SELECT more FROM stuff')

      await secondQuery

      expect(this.client.query).to.have.been.calledThrice
      expect(this.client.query.firstCall.args).to.deep.equal(['BEGIN', []])
      expect(this.client.query.secondCall.args).to.deep.equal(['SELECT foo FROM bar', []])
      expect(this.client.query.thirdCall.args).to.deep.equal(['SELECT more FROM stuff', []])

    })

    it('throws an error if called when the transaction cannot accept a query', async function() {

      this.transactionClient.state = 'COMMITTING'

      await expect(this.transactionClient.query('SELECT foo FROM bar'))
        .to.be.rejectedWith(InvalidTransactionStateError)

    })

  })

  describe('queryModel', function() {

    class TestModel {}

    beforeEach(function() {
      stub(this.transactionClient, 'baseQueryModel')
    })

    it('calls through to baseQueryModel', async function() {
      await this.transactionClient.queryModel(TestModel, 'SELECT foo FROM bar WHERE id = $1', 1)

      expect(this.transactionClient.baseQueryModel).to.have.been.calledOnce
      const call = this.transactionClient.baseQueryModel.firstCall
      const args = call.args
      expect(args[1]).to.equal(TestModel)
      expect(args[2]).to.equal('SELECT foo FROM bar WHERE id = $1')
      expect(args[3]).to.deep.equal([1])
    })

  })

  describe('queryModelSingle', function() {

    class TestModel {}

    beforeEach(function() {
      stub(this.transactionClient, 'baseQueryModelSingle')
    })

    it('calls through to baseQueryModelSingle', async function() {
      await this.transactionClient.queryModelSingle(TestModel, 'SELECT foo FROM bar WHERE id = $1', 1)

      expect(this.transactionClient.baseQueryModelSingle).to.have.been.calledOnce
      const call = this.transactionClient.baseQueryModelSingle.firstCall
      const args = call.args
      expect(args[1]).to.equal(TestModel)
      expect(args[2]).to.equal('SELECT foo FROM bar WHERE id = $1')
      expect(args[3]).to.deep.equal([1])
    })

  })

  describe('commit', function() {

    beforeEach(function() {
      stub(this.transactionClient, 'rollback')
    })

    it('throws an InvalidTransactionState error if no queries have been made', async function() {
      await expect(this.transactionClient.commit()).to.be.rejectedWith(InvalidTransactionStateError)
    })

    it('commits the transaction and sets the internal state to COMMITING', async function() {

      const waiter = (): any => new Promise(resolve => setTimeout(resolve.bind(undefined, { rows: [] }), 1))
      this.client.query.callsFake(waiter)

      await this.transactionClient.query('SELECT foo FROM bar')
      await this.transactionClient.commit()

      expect(this.state).to.have.been.calledWith('COMMITTING')
      expect(this.client.query).to.have.been.calledThrice
      expect(this.client.query).to.have.been.calledWith('BEGIN')
      expect(this.client.query).to.have.been.calledWith('SELECT foo FROM bar')
      expect(this.client.query).to.have.been.calledWith('COMMIT')

      expect(this.transactionClient.rollback).not.to.have.been.called
    })

    it('resets the internal state to IDLE when the commit successfully completes', async function() {
      await this.transactionClient.query('SELECT foo FROM bar')
      await this.transactionClient.commit()
      expect(this.transactionClient.state).to.equal('IDLE')
    })

    it('rolls back the transaction if an error is thrown', async function() {

      await this.transactionClient.query('SELECT foo FROM bar')

      const err = new Error('Your llama is lloose!')
      this.client.query.callsFake((query) => {
        if (query === 'COMMIT') {
          throw err
        }
      })
      await this.transactionClient.commit()

      expect(this.client.query).to.have.been.calledThrice
      expect(this.client.query).to.have.been.calledWith('BEGIN')
      expect(this.client.query).to.have.been.calledWith('SELECT foo FROM bar')
      expect(this.client.query).to.have.been.calledWith('COMMIT')
      expect(this.transactionClient.rollback).to.have.been.calledOnce

      const receivedErr = this.transactionClient.rollback.firstCall.lastArg
      expect(receivedErr).to.be.instanceof(PgDbQueryError)
      expect(receivedErr.innerError).to.equal(err)
    })

    it('rethrows the error if it cannot roll back', async function() {

      this.transactionClient.state = 'READY'
      const err = new Error('Your llama is lloose!')

      this.client.query.callsFake(() => {
        this.transactionClient.state = 'ROLLED_BACK'
        return Promise.reject(err)
      })

      const commitErr = await expect(this.transactionClient.commit()).to.be.rejected
      expect(commitErr.innerError).to.equal(err)

    })
  })

  describe('rollback', function() {

    it('throws an InvalidTransactionState error if no queries have been made', async function() {
      await expect(this.transactionClient.rollback()).to.be.rejectedWith(InvalidTransactionStateError)
    })

    it('attempts to rollback the transaction and sets the internal state to ROLLING_BACK', async function() {

      await this.transactionClient.query('SELECT foo FROM bar')
      await this.transactionClient.rollback()

      expect(this.state).to.have.been.called.calledWith('ROLLING_BACK')

      expect(this.transactionClient.state).to.equal('IDLE')
      expect(this.client.query).to.have.been.calledThrice
      expect(this.client.query).to.have.been.calledWith('ROLLBACK')
    })

    it('rethrows an error if specified', async function() {
      const err = new Error('your llama is lloose!')
      await this.transactionClient.query('SELECT foo FROM bar')

      await expect(this.transactionClient.rollback(err)).to.be.rejectedWith(err)
    })

    it('throws a TransactionRollbackError if an error occurs during the rollback', async function() {

      await this.transactionClient.query('SELECT foo FROM bar')

      const rollbackError = new Error('your llama is lloose!')
      this.client.query.callsFake(() => {
        throw rollbackError
      })

      await expect(this.transactionClient.rollback()).to.be.rejectedWith(TransactionRollbackError)
    })

    it('includes the original query error in the TransactionRollbackError if specified', async function() {

      await this.transactionClient.query('SELECT foo FROM bar')

      const rollbackError = new Error('your llama is lloose!')
      this.client.query.callsFake(() => {
        throw rollbackError
      })

      const resultError = await expect(this.transactionClient.rollback()).to.be.rejectedWith(TransactionRollbackError)
      expect(resultError.innerError.innerError).to.equal(rollbackError)

    })
  })

  describe('dispose', function() {
    beforeEach(function() {
      stub(this.transactionClient, 'commit')
    })

    it('calls dispose() on the pg PoolClient', async function() {
      await this.transactionClient.dispose('')

      expect(this.client.dispose).to.have.been.calledOnce
    })

    it('attempts to commit the transaction if it has begun', async function() {
      this.transactionClient.state = 'READY'

      await this.transactionClient.dispose('')

      expect(this.transactionClient.commit).to.have.been
        .calledOnce
        .calledBefore(this.client.dispose)
    })

    it('does not attempt to commit the transaction if it has already been committed', async function() {
      this.transactionClient.state = 'COMMITTED'

      await this.transactionClient.dispose('')

      expect(this.transactionClient.commit).not.to.have.been.called
    })

    it('releases the client even if an error is thrown, and rethrows the error', async function() {
      this.transactionClient.state = 'READY'
      const err = new Error('Your llama is lloose!')
      this.transactionClient.commit.callsFake(() => {
        throw err
      })

      await expect(this.transactionClient.dispose('')).to.be.rejectedWith(err)
      expect(this.client.dispose).to.have.been.calledOnce
    })
  })
})
