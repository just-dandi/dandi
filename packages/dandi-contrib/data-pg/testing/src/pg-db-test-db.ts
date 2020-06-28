import { ConfigModule, configProvider, EnvConfigClient } from '@dandi/config'
import { Provider, Registerable } from '@dandi/core'
import { RootTestInjector, testHarness, TestInjector } from '@dandi/core/testing'
import { DbClient, DbConnectionInfo, DbUserCredentials } from '@dandi/data'
import { DataPgModule } from '@dandi-contrib/data-pg'
import { Property } from '@dandi/model'
import { ModelBuilderModule } from '@dandi/model-builder'

const INIT_CONN_TOKEN = DbConnectionInfo.configToken('TEST_PG_DB_INIT_CONN_INFO', false)
const TEST_CONN_TOKEN = DbConnectionInfo.configToken('TEST_PG_DB_CONN_INFO', false)
const CREDS = DbUserCredentials.configToken('TEST_PG_DB_CREDENTIALS', false)

async function invokeProvider<T>(parentInjector: TestInjector, provider: Provider<T>): Promise<T> {
  const injector = parentInjector.createChild(`invoke${Math.random()}`, provider)
  return await injector.inject(provider.provide)
}

class Count {
  @Property(Number)
  public count: number
}

export class PgDbTestModel {

  @Property(Number)
  public id: number

  @Property(String)
  public data: string

}

export function pgTestDbHarness(...entries: Registerable[]): RootTestInjector {

  const harness = testHarness(
    ConfigModule,
    DataPgModule,
    ModelBuilderModule,
    ...entries,
  )

  before(async () => {
    const beforeHarness = await harness.single(
      EnvConfigClient.provider(INIT_CONN_TOKEN),
      EnvConfigClient.provider(CREDS),
    )
    const client = await beforeHarness.inject(DbClient)
    const config = await invokeProvider(beforeHarness, configProvider(EnvConfigClient, TEST_CONN_TOKEN))
    const hasDb = (await client.queryModelSingle(
      Count,
        `SELECT COUNT (*) FROM pg_database WHERE datname = $1`, config.database)
    ).count > 0
    if (!hasDb) {
      await client.query(`CREATE DATABASE ${config.database}`)
    }
  })

  const harnessInstance = harness.clone(
    EnvConfigClient.provider(TEST_CONN_TOKEN),
    EnvConfigClient.provider(CREDS),
  )

  beforeEach(async () => {
    const client = await harnessInstance.inject(DbClient)
    const hasTable = (await client.queryModelSingle(Count, `SELECT COUNT (*) FROM pg_tables WHERE tablename='dandi_test'`)).count
    if (hasTable) {
      await client.query(`DELETE FROM public.dandi_test`)
    } else {
      await client.query(`CREATE TABLE public.dandi_test (id SERIAL PRIMARY KEY, data VARCHAR(256) NOT NULL)`)
    }
  })

  return harnessInstance
}
