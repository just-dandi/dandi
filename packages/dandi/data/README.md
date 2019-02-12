# @dandi/data

The `@dandi/data` package provides basic types and helpers for data
clients that connect databases and other data providers to your Dandi
application. These types provide a standard interface for working with
external data within Dandi.

## Implementations

The interfaces defined in `@dandi/data` are intended to allow wrapping
existing database client implementations (e.g. `node-postgres`) and
extending their functionality with Dandi.

## Configuration

Use a `@dandi/config` configuration provider to supply connection and
authentication information to the `@dandi/data` client. This example
uses `AwsSsmConfigClient` and the `@dandi-contrib/data-pg` client.

```typescript
import { AwsSsmConfigClient } from '@dandi-contrib/config-aws-ssm';
import { Container } from '@dandi/core';
import { PgDbModule } from '@dandi-contrib/data-pg';

const myApp = new Container({
  providers: [

    ...

    // database
    PgDbModule,

    AwsSsmConfigClient.provider(DbConnectionInfo.configToken(`myapp-postgres-connection-info`)),
    AwsSsmConfigClient.provider(DbUserCredentials.configToken(`myapp-postgres-credentials`)),

    ...

  ],
});
```

## API Reference

This reference describes the generic interfaces defined by `@dandi/data`.
Each implementation may vary, but this documentation describes the
intention of the interfaces.

### DbConnectionInfo

A model for describing connection info for a database connection. Used
with `@dandi/config` to allow retrieving from a configuration provider
like AWS SSM (see [@dandi-contrib/config-aws-ssm](../../dandi-contrib/config-aws-ssm).

### DbUserCredentials

A model for describing user credentials for authenticating with a
database. Used with `@dandi/config` to allow retrieving from a
configuration provider like AWS SSM (see
[@dandi-contrib/config-aws-ssm](../../dandi-contrib/config-aws-ssm).

### DbQueryable

The most basic client interface for working with a database.

- **`query(cmd: string, ...args: any[]): Promise<any[]>`** - sends a
  parameterized query to the underlying database client and returns
  the resulting rows directly, without any model conversion or
  validation.

- **`queryModel<T>(model: Constructor<T>, cmd: string, ...args: any[]): Promise<T[]>`** -
  sends a parameterized query to the underlying database client and
  returns all rows, converting (and optionally validating) each row using
  the configured `ModelBuilder`.

- **`queryModelSingle<T>(model: Constructor<T>, cmd: string, ...args: any[]): Promise<T>`** -
  same as `queryModel`, but only returns the first row. Throws a
  `PgDbMultipleResultsError` if more than one row is returned by the
  database. Returns `null` if no rows are returned.

### DbClient

Extends `DbQueryable` to allow using transactions.

- **`transaction<T>(transactionFn: TransactionFn<T>): Promise<T>`** -
  initiates a database transaction, creates a `DbTransactionClient`
  instance, and uses it to invoke the provided `transactionFn`.

### DbTransactionClient

An extension of `DbQueryable` that is used during a transaction. Also
extends `Disposable`. The transaction is automatically committed during
`dispose()` unless an exception is thrown, in which case it is
automatically rolled back.

- **`commit()`** - commits the transaction.
- **`rollback()`** - rolls back the transaction.

## Transaction Example

```typescript
export class MyModelManager {
  constructor(@Inject(DbClient) private dbClient: DbClient) {}

  public addModel(model: MyModelRequest): Promise<MyModel> {
    return this.dbClient.transaction(async (tran) => {
      const query1 = await tran.queryModelSingle(MyModel, INSERT_QUERY, model.name);
      const query2 = await tran.query(INSERT_MODEL_PERMISSION);
      return query1;
    });
  }
}
```
