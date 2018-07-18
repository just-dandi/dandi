import { DataMapper, PassThroughDataMapper } from '@dandi/data';
import { ModelValidator } from '@dandi/model-validation';

import { expect } from 'chai';
import { stub, createStubInstance, SinonStubbedInstance } from 'sinon';

import { PgDbQueryableBase, PgDbQueryableClient } from './pg.db.queryable';

describe('PgDbQueryableBase', () => {

    let client: SinonStubbedInstance<PgDbQueryableClient>;
    let dataMapper: SinonStubbedInstance<DataMapper>;
    let queryable: PgDbQueryableBase<PgDbQueryableClient>;
    let modelValidator: ModelValidator;
    let clientResult: any;

    beforeEach(() => {
        clientResult = { rows: [{ id: 'a' }, { id: 'b' }] };
        client = {
            query: stub().returns(clientResult),
        };
        dataMapper = createStubInstance(PassThroughDataMapper);
        modelValidator = {
            validateMember: stub(),
            validateModel: stub(),
        };
        queryable = new PgDbQueryableBase<PgDbQueryableClient>(client, dataMapper, modelValidator);
    });
    afterEach(() => {
        client = undefined;
        dataMapper = undefined;
        modelValidator = undefined;
        queryable = undefined;
    });

    describe('query', () => {

        it('passes the cmd and args arguments to the client', async () => {

            const cmd = 'SELECT foo FROM bar WHERE ix = $1';
            const args = 'nay';

            await queryable.query(cmd, args);

            expect(client.query).to.have.been.calledWithExactly(cmd, [args]);

        });

        it('returns the result of passing the rows property through dataMapper.mapFromDb()', async () => {

            const value = { id: 'c' };
            dataMapper.mapFromDb.returns(value);

            const cmd = 'SELECT foo FROM bar WHERE ix = $1';
            const args = ['nay'];

            const result = await queryable.query(cmd, args);

            expect(dataMapper.mapFromDb).to.have.been.calledWith(clientResult.rows[0]);
            expect(result).to.deep.equal([value, value]);

        });

    });



});
