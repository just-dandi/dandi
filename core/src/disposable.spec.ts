import {
    AlreadyDisposedError,
    Disposable,
    DisposableFunctionError,
    DisposableTypeError,
    InvalidDisposeTargetError,
} from '../index';

import { expect } from 'chai';
import { SinonStubbedInstance, stub, SinonStub } from 'sinon';

describe('Disposable', () => {

    describe('isDisposable', () => {
        it('returns true if the object has a dispose function', () => {
            expect(Disposable.isDisposable({ dispose: () => {} })).to.be.true;
        });

        it('returns false if the object is null', () => {
            expect(Disposable.isDisposable(null)).to.be.false;
        });

        it('returns false if the object is undefined', () => {
            expect(Disposable.isDisposable(undefined)).to.be.false;
        });

        it('returns false if the object has a dispose property that is not a function', () => {
            expect(Disposable.isDisposable({ dispose: 'foo' })).to.be.false;
        });
    });

    describe('makeDisposable', () => {

        it('throws an error if the object is null', () => {
            expect(() => Disposable.makeDisposable(null, null)).to.throw(DisposableTypeError);
        });

        it('throws an error if the object is undefined', () => {
            expect(() => Disposable.makeDisposable(undefined, null)).to.throw(DisposableTypeError);
        });

        it('throws an error if the object is not an object', () => {
            expect(() => Disposable.makeDisposable('heyyy', null)).to.throw(DisposableTypeError);
        });

        it('throws an error if the dispose function is not a function', () => {
            expect(() => Disposable.makeDisposable({}, null)).to.throw(DisposableFunctionError);
        });

        it('sets the dispose function on an object with no existing dispose function', () => {
            const dispose = () => {};
            expect(Disposable.makeDisposable({}, dispose).dispose).to.equal(dispose);
        });

        describe('wrapping existing dispose functions', () => {
            let stubs: {
                existingDispose: SinonStub,
                newDispose: SinonStub,
            };
            let obj: Disposable;

            beforeEach(() => {
                stubs = {
                    existingDispose: stub(),
                    newDispose: stub(),
                };
                obj = {
                    dispose: stubs.existingDispose,
                };
            });
            afterEach(() => {
                stubs = undefined;
                obj = undefined;
            });

            it('wraps an existing dispose function', () => {
                Disposable.makeDisposable(obj, stubs.newDispose);
                expect(obj.dispose).not.to.equal(stubs.existingDispose);
                expect(obj.dispose).not.to.equal(stubs.newDispose);
            });

            it('calls an existing dispose function before the new one', () => {
                Disposable.makeDisposable(obj, stubs.newDispose).dispose('');
                expect(stubs.existingDispose).to.have.been.calledBefore(stubs.newDispose);
            });

            it('calls the new dispose function even if the existing one throws an error', () => {
                stubs.existingDispose.throwsException(new Error());
                const catchStub = stub();

                try {
                    // for some reason, using expect(...).to.throw changes the behavior of the try/catch
                    // and it doesn't actually call the function in the finally block
                    Disposable.makeDisposable(obj, stubs.newDispose).dispose('');
                } catch (err) {
                    catchStub(err);
                }

                expect(catchStub).to.have.been.called;
                expect(stubs.newDispose).to.have.been.calledAfter(stubs.existingDispose);
            });
        });

    });

    describe('use', () => {

        let stubs: SinonStubbedInstance<{ use: () => any, dispose: () => void }>;
        let obj: Disposable;

        beforeEach(() => {
            stubs = {
                use: () => {},
                dispose: () => {},
            } as SinonStubbedInstance<{ use: () => any, dispose: () => void }>;
            stub(stubs, 'use');
            stub(stubs, 'dispose');
            obj = { dispose: stubs.dispose };
        });

        afterEach(() => {
            stubs = undefined;
            obj = undefined;
        });

        it('calls the use function with the object', () => {
            Disposable.use(obj, stubs.use);
            expect(stubs.use).to.have.been.calledWith(obj);
        });

        it('returns the result of the use function', () => {
            const result = {};
            stubs.use.returns(result);
            expect(Disposable.use(obj, stubs.use)).to.equal(result);
        });

        it('calls the dispose function of the object', () => {
            Disposable.use(obj, stubs.use);
            expect(stubs.dispose).to.have.been.called;
        });

        it('rethrows errors caught while executing the use function', () => {
            const error = new Error();
            stubs.use.throws(error);
            expect(() => Disposable.use(obj, stubs.use)).to.throw(error);
        });

        it('calls the dispose function even if the use function throws', () => {
            const error = new Error();
            stubs.use.throws(error);
            try {
                Disposable.use(obj, stubs.use);
            } catch (err) {

            }
            expect(stubs.dispose).to.have.been.called;
        });

        it('does not attempt to call the dispose function if the object is not a Disposable', () => {
            Disposable.use({}, stubs.use);
            expect(stubs.use).to.have.been.called;
        })

    });

    describe('useAsync', () => {

        let stubs: SinonStubbedInstance<{ use: () => any, dispose: () => void }>;
        let obj: Disposable;

        beforeEach(() => {
            stubs = {
                use: () => new Promise(resolve => setTimeout(resolve, 10)),
                dispose: () => {},
            } as SinonStubbedInstance<{ use: () => any, dispose: () => void }>;
            stub(stubs, 'use').callsFake(async () => {});
            stub(stubs, 'dispose');
            obj = { dispose: stubs.dispose };
        });

        afterEach(() => {
            stubs = undefined;
            obj = undefined;
        });

        it('calls the use function with the object', async () => {
            await Disposable.useAsync(obj, stubs.use);
            expect(stubs.use).to.have.been.calledWith(obj);
        });

        it('returns the result of the use function', async () => {
            const expected = {};
            stubs.use.callsFake(() => new Promise(resolve => setTimeout(resolve.bind(null, expected), 10)));
            const actual = await Disposable.useAsync(obj, stubs.use);
            expect(expected).to.equal(actual);
        });

        it('calls the dispose function of the object', async () => {
            await Disposable.useAsync(obj, stubs.use);
            expect(stubs.dispose).to.have.been.called;
        });

        it('rethrows errors caught while executing the use function', async () => {
            const error = new Error();
            stubs.use.callsFake(async () => { throw error; });
            const errStub = stub();
            try {
                await Disposable.useAsync(obj, stubs.use);
            } catch (err) {
                errStub(err);
            }
            expect(errStub).to.have.been.calledWith(error);
        });

        it('calls the dispose function even if the use function throws', async () => {
            const error = new Error();
            stubs.use.throws(error);
            try {
                await Disposable.useAsync(obj, stubs.use);
            } catch (err) {
            }
            expect(stubs.dispose).to.have.been.called;
        });

        it('does not attempt to call the dispose function if the object is not disposable', async () => {

            const nonDisp: any = {};
            await expect(Disposable.useAsync(nonDisp, stubs.use)).to.be.fulfilled;

        });

    });

    describe('remapDisposed', () => {

        it('replaces functions with a function that throws an error', () => {

            const obj = {
                foo: () => {},
            };
            Disposable.remapDisposed(obj, '');

            expect(() => obj.foo()).to.throw(AlreadyDisposedError);

        });

        it('replaces properties with get accessor that throws an error', () => {

            const obj = {
                foo: 'bar',
            };
            Disposable.remapDisposed(obj, '');

            expect(() => obj.foo).to.throw(AlreadyDisposedError);

        });

        it('freezes the target so that it cannot be modified', () => {

            const obj: any = {
                foo: () => {},
            };
            Disposable.remapDisposed(obj, '');
            expect(() => obj.bar = true).to.throw;
            expect(obj.bar).to.be.undefined;

        });

        it('adds a get accessor disposed property that returns true', () => {

            const obj: any = {};
            Disposable.remapDisposed(obj, '');
            expect(obj.disposed).to.be.true;

        });

    });

});

describe('InvalidDisposeTargetError', () => {

    it('can be instantiated', () => {

        expect(() => new InvalidDisposeTargetError('oops!')).not.to.throw;
        new InvalidDisposeTargetError('okay!');

    });

});
