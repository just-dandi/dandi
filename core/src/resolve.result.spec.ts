import { Disposable } from '@dandi/common';

import { ResolveResult, ResolverContext } from '../';

import { createStubInstance, SinonStubbedInstance } from 'sinon';

import { expect } from 'chai';

describe('ResolveResult', () => {

    let context: { disposed: boolean } & SinonStubbedInstance<Disposable>;
    let value: any;
    let result: ResolveResult<any>;

    beforeEach(() => {
        context = createStubInstance(ResolverContext) as any as { disposed: boolean } & SinonStubbedInstance<Disposable>;
        value = {};
        result = new ResolveResult<any>(context, value);

    });

    afterEach(() => {
        context = undefined;
        value = undefined;
        result = undefined;
    });

    describe('value', () => {
        it('passes the result value through', () => {
            expect(result.value).to.equal(value);
        });
    });

    describe('singleValue', () => {
        it('passes the result value through', () => {
            expect(result.singleValue).to.equal(value);
        });
    });

    describe('arrayValue', () => {
        it('passes the result value through', () => {
            expect(result.arrayValue).to.equal(value);
        });
    });

    describe('dispose', () => {
        it('calls dispose on the context', () => {
            result.dispose('test');
            expect(context.dispose).to.have.been.called;
        });
    });

});
