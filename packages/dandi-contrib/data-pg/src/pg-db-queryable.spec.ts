import { PgDbMultipleResultsError, PgDbPoolClient, PgDbQueryError } from '@dandi-contrib/data-pg'
import { PgDbPoolClientFixture, PgDbQueryableBase, PgDbQueryableClient } from '@dandi-contrib/data-pg/testing'
import { Url, Uuid } from '@dandi/common'
import { stubHarness } from '@dandi/core/testing'
import { Property } from '@dandi/model'
import { ModelBuilder } from '@dandi/model-builder'
import { ModelBuilderFixture } from '@dandi/model-builder/testing'

import { expect } from 'chai'

describe('PgDbQueryableBase', function () {
  const harness = stubHarness(PgDbPoolClientFixture.factory(), ModelBuilderFixture.factory)

  beforeEach(async function () {
    PgDbPoolClientFixture.result({ rows: [{ id: 'a' }, { id: 'b' }] })
    this.client = await harness.injectStub(PgDbPoolClient)
    // FIXME: refactor calls to pass this.client
    this.queryable = new PgDbQueryableBase<PgDbQueryableClient>(await harness.inject(ModelBuilder))
  })

  describe('query/queryInternal', function () {
    it('passes the cmd and args arguments to the client', async function () {
      const cmd = 'SELECT foo FROM bar WHERE ix = $1'
      const args = 'nay'

      await this.queryable.baseQuery(this.client, cmd, [args])

      expect(this.client.query).to.have.been.calledWithExactly(cmd, [args])
    })

    it('correctly formats Uuid instances', async function () {
      const cmd = 'SELECT foo FROM bar WHERE id = $1'
      const id = Uuid.create()

      await this.queryable.baseQuery(this.client, cmd, [id])

      expect(this.client.query).to.have.been.calledWithExactly(cmd, [`{${id}}`])
    })

    it('correctly formats Url instances', async function () {
      const cmd = 'SELECT foo FROM bar WHERE url = $1'
      const url = new Url('https://google.com')

      await this.queryable.baseQuery(this.client, cmd, [url])

      expect(this.client.query).to.have.been.calledWithExactly(cmd, [url.toString()])
    })

    it('correctly formats values of nested arrays', async function () {
      const cmd = 'SELECT foo FROM bar WHERE id in ($1, $2, $3)'
      const id1 = Uuid.create()
      const id2 = Uuid.create()
      const id3 = Uuid.create()

      await this.queryable.baseQuery(this.client, cmd, [[id1, id2, id3]])

      expect(this.client.query).to.have.been.calledWithExactly(cmd, [[`{${id1}}`, `{${id2}}`, `{${id3}}`]])
    })

    it('wraps any query errors in PgDbQueryError', async function () {
      const err = new Error('Your llama is lloose!')
      PgDbPoolClientFixture.throws(err)

      const rethrownErr = await expect(this.queryable.baseQuery(this.client, 'SELECT foo FROM bar')).to.be.rejectedWith(
        PgDbQueryError,
      )
      expect(rethrownErr.innerError).to.equal(err)
    })
  })

  describe('queryModel', function () {
    class TestModel {
      public foo: string
    }

    beforeEach(async function () {
      this.modelBuilder = await harness.injectStub(ModelBuilder)
    })

    it('returns an empty array if the underlying query did not return any rows', async function () {
      PgDbPoolClientFixture.result({ rows: [] })

      const result = await this.queryable.baseQueryModel(this.client, TestModel, 'Select foo FROM bar')

      expect(result).to.be.an.instanceof(Array)
      expect(result).to.be.empty
    })

    it('converts each of the returned rows using the modelBuilder instance', async function () {
      await this.queryable.baseQueryModel(this.client, TestModel, 'SELECT foo FROM bar')

      await expect(this.modelBuilder.constructModel)
        .to.have.been.calledTwice.calledWithExactly(TestModel, { id: 'a' }, undefined)
        .calledWithExactly(TestModel, { id: 'b' }, undefined)
    })

    describe('queryModelSingle', function () {
      it('returns undefined if queryModel returns no value or an empty array', async function () {
        PgDbPoolClientFixture.result({})
        expect(await this.queryable.baseQueryModelSingle(this.client, TestModel, 'SELECT foo FROM bar')).to.be.undefined

        PgDbPoolClientFixture.result({ rows: [] })
        expect(await this.queryable.baseQueryModelSingle(this.client, TestModel, 'SELECT foo FROM bar')).to.be.undefined
      })

      it('throws a PgDbMultipleResultsError if the query returns more than one result', async function () {
        await expect(
          this.queryable.baseQueryModelSingle(this.client, TestModel, 'SELECT foo FROM bar'),
        ).to.be.rejectedWith(PgDbMultipleResultsError)
      })

      it('returns the only result if there is one', async function () {
        const result = { id: 'c' }
        PgDbPoolClientFixture.result({ rows: [result] })
        this.modelBuilder.constructModel.returnsArg(1)

        expect(await this.queryable.baseQueryModelSingle(this.client, TestModel, 'SELECT foo FROM bar')).to.equal(
          result,
        )
      })
    })
  })

  describe('replaceSelectList', function () {
    class AnotherModel {
      @Property(Uuid)
      public anotherId: Uuid
    }

    class SomeModel {
      @Property(Uuid)
      public someId: Uuid

      @Property(Uuid)
      public anotherId: Uuid
    }

    class TestModel {
      @Property(SomeModel)
      public someProperty: SomeModel

      @Property(AnotherModel)
      public anotherProperty: AnotherModel
    }

    it('ignores queries that are not SELECT queries and returns them unchanged', function () {
      const cmd = 'INSERT (foo) VALUES (bar) INTO table'
      expect(this.queryable.replaceSelectList(TestModel, cmd)).to.equal(cmd)
    })

    it('returns the original command if none of the select arguments match the aliased table names', function () {
      const cmd = 'SELECT id FROM bar bar'
      expect(this.queryable.replaceSelectList(TestModel, cmd)).to.equal(cmd)
    })

    it('returns the original command if the model does not have any decorated properties matching the select arguments', function () {
      const cmd = 'SELECT non_existent_thing FROM non_existent_stuff non_existent_thing'
      expect(this.queryable.replaceSelectList(TestModel, cmd)).to.equal(cmd)
    })

    it('expands column selection based on decorated properties', function () {
      const sourceCmd = `SELECT
  some_property,
  another_property
FROM some_stuff some_property
LEFT JOIN another_stuff another_property
  ON some_property.another_id = another_property.another_id`

      const expectedExpandedCmd = `select
  some_property.some_id as "some_property.some_id",
  some_property.another_id as "some_property.another_id",
  another_property.another_id as "another_property.another_id"
from some_stuff some_property
LEFT JOIN another_stuff another_property
  ON some_property.another_id = another_property.another_id`
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleLowerCase()

      const result = this.queryable
        .replaceSelectList(TestModel, sourceCmd)
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase()

      expect(result).to.equal(expectedExpandedCmd)
    })
  })
})
