// tslint:disable no-unused-expression
import { expect } from 'chai';

import { ModelBase } from './model.base';

describe('ModelBase', () => {

    class TestImpl extends ModelBase {
        constructor(source?: any) {
            super(source);
        }
    }

    describe('ctr', () => {

        it('assigns any properties from the source to the instance', () => {

            expect(new TestImpl({ foo: 'bar' })).to.include({ foo: 'bar' });

        });

        it('does not require a source object', () => {

            expect(new TestImpl()).to.be.empty;

        });

    });

});
