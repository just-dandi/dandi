import { AppError } from '@dandi/common';
import { Container, Logger, NoopLogger, Resolver } from '@dandi/core';
import { DecoratorModelBuilder, ModelBuilder } from '@dandi/model-builder';
import { PgDbClient, PgDbPool, TransactionAlreadyInProgressError } from '@dandi/data-pg';

import { expect } from 'chai';
import { PoolClient } from 'pg';
import { createStubInstance, SinonStub, SinonStubbedInstance, stub } from 'sinon';

describe('PgDbClient', () => {
  let pool: PgDbPool & SinonStubbedInstance<PgDbPool>;
  let poolClient: SinonStubbedInstance<PoolClient>;
  let modelValidator: SinonStubbedInstance<ModelBuilder>;
  let resolver: SinonStubbedInstance<Resolver>;
  let logger: SinonStubbedInstance<Logger>;
  let dbClient: PgDbClient;

  beforeEach(() => {
    poolClient = {
      query: stub().returns({ rows: [] }),
      release: stub(),
    } as any;
    modelValidator = createStubInstance(DecoratorModelBuilder);
    resolver = createStubInstance(Container);
    logger = createStubInstance(NoopLogger);
    dbClient = new PgDbClient(pool, modelValidator, resolver, logger);
  });
  afterEach(() => {
    pool = undefined;
    poolClient = undefined;
    modelValidator = undefined;
    resolver = undefined;
    logger = undefined;
    dbClient = undefined;
  });

  xdescribe('transaction', () => {
    it('throws if a transaction is already in progress', async () => {
      dbClient.transaction(async () => {});
      await expect(dbClient.transaction(async () => {})).to.be.rejectedWith(TransactionAlreadyInProgressError);
    });

    it('calls the transactionFn and then automatically disposes the transaction', async () => {
      let transactionDispose: SinonStub;
      const transactionFn = stub().callsFake((transaction) => (transactionDispose = stub(transaction, 'dispose')));

      await dbClient.transaction(transactionFn);

      expect(transactionFn).to.have.been.calledBefore(transactionDispose);
    });

    it('can be used to call multiple serial transactions', async () => {
      await dbClient.transaction(async () => {});
      await dbClient.transaction(async () => {});
    });

    it('rethrows errors', async () => {
      const err = new AppError();
      await expect(
        dbClient.transaction(() => {
          throw err;
        }),
      ).to.be.rejectedWith(err);
    });

    it('can be used to call subsequent transactions after one that throws an error', async () => {
      const err = new AppError();
      const second = stub();

      await expect(
        dbClient.transaction(() => {
          throw err;
        }),
      ).to.be.rejectedWith(err);
      await dbClient.transaction(second);

      expect(second).to.have.been.called;
    });
  });

  xdescribe('dispose', () => {
    it('calls dispose() on the current transaction, if there is one', async () => {
      let transactionDispose: SinonStub;
      let waiter;
      const transactionDisposePromise = new Promise<SinonStub>((resolve) => {
        waiter = resolve;
      });
      const transactionFn = stub().callsFake((transaction) => {
        waiter(stub(transaction, 'dispose'));
      });

      dbClient.transaction(transactionFn);
      transactionDispose = await transactionDisposePromise;
      expect(transactionDispose).not.to.have.been.called;
      dbClient.dispose('');
      expect(transactionDispose).to.have.been.called;
    });
  });
});
