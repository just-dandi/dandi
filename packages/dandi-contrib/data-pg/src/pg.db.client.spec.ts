import { AppError } from '@dandi/common'
import { stubHarness } from '@dandi/core/testing'
import { PgDbClient, PgDbPoolClient, TransactionAlreadyInProgressError } from '@dandi-contrib/data-pg'

import { expect } from 'chai'
import { SinonStub, stub } from 'sinon'

describe('PgDbClient', function() {

  const harness = stubHarness(PgDbClient,
    {
      provide: PgDbPoolClient,
      useFactory: () => ({
        query: stub().returns({ rows: [] }),
        release: stub(),
      }),
    },
  )

  beforeEach(async function () {
    this.dbClient = await harness.inject(PgDbClient)
  })

  xdescribe('transaction', function() {
    it('throws if a transaction is already in progress', async function() {
      this.dbClient.transaction(async () => {})
      await expect(this.dbClient.transaction(async () => {})).to.be.rejectedWith(TransactionAlreadyInProgressError)
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
  })

  xdescribe('dispose', function() {
    it('calls dispose() on the current transaction, if there is one', async function() {
      let waiter
      const transactionDisposePromise = new Promise<SinonStub>((resolve) => {
        waiter = resolve
      })
      const transactionFn = stub().callsFake((transaction) => {
        waiter(stub(transaction, 'dispose'))
      })

      this.dbClient.transaction(transactionFn)
      const transactionDispose = await transactionDisposePromise
      expect(transactionDispose).not.to.have.been.called
      this.dbClient.dispose('')
      expect(transactionDispose).to.have.been.called
    })
  })
})
