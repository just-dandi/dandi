/* tslint:disable no-unused-expression */
import { expect }        from 'chai';
import { SinonSpy, spy } from 'sinon';

import { stubConsole } from './console.util';

describe('stubConsole', () => {

    let reader: SinonSpy;

    beforeEach(() => {
        reader = spy(process.stdout, 'write');
    });

    afterEach(() => {
        reader.restore();
    });

    describe('when disabled', () => {

        it('allows console messages to pass through when not enabled', () => {
            console.log('');
            expect(reader).to.have.been.calledWith('\n');
        });

    });

    describe('when enabled', () => {

        stubConsole();

        it('prevents console messages from being passed through', () => {
            console.log('foo');
            expect(reader).not.to.have.been.called;
        });
    });

    describe('when passed an empty array', () => {

        stubConsole([]);

        it('uses the default set of methods', () => {

            console.debug('foo');
            console.log('foo');
            console.info('foo');
            console.warn('foo');
            expect(reader).not.to.have.been.called;

        });

    });

});
