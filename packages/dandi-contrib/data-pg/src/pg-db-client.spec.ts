import { PgDbClient, PgDbTransactionClient, PgDbPoolClient } from '@dandi-contrib/data-pg'
import { PgDbPoolClientFixture } from '@dandi-contrib/data-pg/testing'
import { AppError } from '@dandi/common'
import { stubHarness } from '@dandi/core/testing'
import { ModelBuilderFixture } from '@dandi/model-builder/testing'

import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('PgDbClient', function() {

  const harness = stubHarness(PgDbClient,
    PgDbPoolClientFixture.factory(),
    ModelBuilderFixture.factory,
    PgDbTransactionClient,
  )

  beforeEach(async function () {
    this.pool = await harness.injectStub(PgDbPoolClient)
    this.dbClient = await harness.inject(PgDbClient)
  })

  describe('transaction', function() {
    it('creates a transaction client and calls the specified function with it', async function() {

      const fn = stub()
      await this.dbClient.transaction(fn)

      expect(fn).to.have.been.called
      expect(fn.firstCall.lastArg).to.be.instanceof(PgDbTransactionClient)
    })

    it('can create multiple active transactions', async function() {
      const first = stub()

      this.dbClient.transaction(async () => {}).then(first)
      expect(first).not.to.have.been.called // sanity check

      await expect(this.dbClient.transaction(async () => {})).to.be.fulfilled
    })

    it('calls the transactionFn and then automatically disposes the transaction', async function() {
      let transactionDispose: SinonStub
      const transactionFn = stub().callsFake((transaction) => (transactionDispose = stub(transaction, 'dispose')))

      await this.dbClient.transaction(transactionFn)

      expect(transactionFn).to.have.been.calledBefore(transactionDispose)
    })

    it('can be used to call multiple serial transactions', async function() {
      await this.dbClient.transaction(async () => {})
      await this.dbClient.transaction(async () => {})
    })

    it('rethrows errors', async function() {
      const err = new AppError()
      await expect(
        this.dbClient.transaction(() => {
          throw err
        }),
      ).to.be.rejectedWith(err)
    })

    it('can be used to call subsequent transactions after one that throws an error', async function() {
      const err = new AppError()
      const second = stub()

      await expect(
        this.dbClient.transaction(() => {
          throw err
        }),
      ).to.be.rejectedWith(err)
      await this.dbClient.transaction(second)

      expect(second).to.have.been.called
    })

    it('creates multiple transaction clients in a way to allows one to fail without affecting the other', async function() {
      let onTxnClient1: Function
      const txnClient1 = new Promise(resolve => onTxnClient1 = resolve)
      let onTxnClient2: Function
      const txnClient2 = new Promise(resolve => onTxnClient2 = resolve)

      let onReady: Function
      const ready = new Promise(resolve => onReady = resolve)

      const txn1 = this.dbClient.transaction(async txnClient => { onTxnClient1(txnClient); await ready; throw new Error('oh nooo') })
      const txn2 = this.dbClient.transaction(async txnClient => { onTxnClient2(txnClient); await ready; return 'hi!' })

      expect(await txnClient1).not.to.equal(await txnClient2)
      onReady()

      await expect(txn1).to.be.rejectedWith('oh nooo')
      await expect(txn2).to.become('hi!')
    })
  })

  describe('query', function() {

    beforeEach(function() {
      stub(this.dbClient, 'baseQuery')
    })

    it('calls through to baseQuery', async function() {
      await this.dbClient.query('SELECT foo FROM bar WHERE id = $1', 1)

      expect(this.dbClient.baseQuery).to.have.been
        .calledOnce
        .calledWithExactly(this.pool, 'SELECT foo FROM bar WHERE id = $1', [1])
    })

  })

  describe('queryModel', function() {

    class TestModel {}

    beforeEach(function() {
      stub(this.dbClient, 'baseQueryModel')
    })

    it('calls through to baseQueryModel', async function() {
      await this.dbClient.queryModel(TestModel, 'SELECT foo FROM bar WHERE id = $1', 1)

      expect(this.dbClient.baseQueryModel).to.have.been
        .calledOnce
        .calledWithExactly(this.pool, TestModel, 'SELECT foo FROM bar WHERE id = $1', [1])
    })

  })

  describe('queryModelSingle', function() {

    class TestModel {}

    beforeEach(function() {
      stub(this.dbClient, 'baseQueryModelSingle')
    })

    it('calls through to baseQueryModelSingle', async function() {
      await this.dbClient.queryModelSingle(TestModel, 'SELECT foo FROM bar WHERE id = $1', 1)

      expect(this.dbClient.baseQueryModelSingle).to.have.been
        .calledOnce
        .calledWithExactly(this.pool, TestModel, 'SELECT foo FROM bar WHERE id = $1', [1])
    })

  })

  describe('dispose', function() {
    it('calls dispose() on the current transaction, if there is one', async function() {

      let resolveDispose: Function
      const disposePromise = new Promise(resolve => resolveDispose = resolve)

      const transactionFn = stub().callsFake((transaction) => {
        resolveDispose(stub(transaction, 'dispose'))
        return new Promise(() => {})
      })

      const after = stub()
      this.dbClient.transaction(transactionFn).then(after)
      const dispose = await disposePromise

      expect(dispose).not.to.have.been.called
      expect(after).not.to.have.been.called
      await this.dbClient.dispose('')
      expect(dispose).to.have.been.called
    })
  })
})
