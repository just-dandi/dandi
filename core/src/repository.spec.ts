import { InvalidDisposeTargetError } from '@dandi/common';
import {
    ConflictingRegistrationOptionsError, InvalidRegistrationTargetError,
    InvalidRepositoryContextError, OpinionatedProviderOptionsConflictError, OpinionatedToken, Provider,
    ProviderTypeError, Repository, SymbolToken,
} from '../';

import { expect } from 'chai';
import { spy }    from 'sinon';

class TestClass { }

describe('Repository', () => {

    let repo: Repository;
    let token: SymbolToken<any>;
    let value: any;
    let provider: Provider<any>;

    beforeEach(() => {
        repo = Repository.for('test');
        token = new SymbolToken<any>('test');
        value = {};
        provider = {
            provide: token,
            useValue: value,
        };
    });

    afterEach(() => {
        repo = undefined;
        token = undefined;
        value = undefined;
        provider = undefined;
    });

    describe('register', () => {

        it('sets ProviderOptions from an OpinionatedToken', () => {

            const token = new OpinionatedToken('test-op', { multi: true });
            const provider = {
                provide: token,
                useFactory: () => value,
            };
            repo.register(provider);
            expect((provider as any).multi).to.be.true;

        });

        it('throw an error if ProviderOptions from an OpinionatedToken conflict with the provider', () => {

            const token = new OpinionatedToken('test-op', { multi: true });
            const provider = {
                provide: token,
                useFactory: () => value,
                multi: false,
            };
            expect(() => repo.register(provider)).to.throw(OpinionatedProviderOptionsConflictError);

        });

        it('registers a provider by its injection token', () => {

            repo.register(provider);

            expect((repo as any).providers).to.contain.keys(provider.provide);
            expect((repo as any).providers.get(provider.provide)).to.equal(provider);

        });

        it('registers a class using the class as the injection token if no token is specified in the options', () => {

            repo.register(TestClass);

            expect((repo as any).providers).to.contain.keys(TestClass);
            expect((repo as any).providers.get(TestClass)).to.deep.equal({
                provide: TestClass,
                useClass: TestClass,
                multi: undefined,
                singleton: undefined,
            });

        });

        it('registers a class using the injection token specified in the options, if specified', () => {

            repo.register(TestClass, { provide: token });

            expect((repo as any).providers).to.contain.keys(token);
            expect((repo as any).providers.get(token)).to.deep.equal({
                provide: token,
                useClass: TestClass,
                multi: undefined,
                singleton: undefined,
            });

        });

        it('leaves the multi and singleton options undefined if they are not specified', () => {

            repo.register(TestClass, { provide: token });

            expect((repo as any).providers.get(token).multi).to.be.undefined;
            expect((repo as any).providers.get(token).singleton).to.be.undefined;

        });

        it('throws an error if the registration target is not a class or provider', () => {

            expect(() => repo.register(null)).to.throw(InvalidRegistrationTargetError);
            expect(() => repo.register({} as any)).to.throw(InvalidRegistrationTargetError);

        });

        it('overwrites registrations when the multi option is not set', () => {

            repo.register(provider);
            const overwritingProvider = {
                provide: provider.provide,
                useValue: {},
            };
            repo.register(overwritingProvider);

            expect((repo as any).providers).to.contain.keys(provider.provide);
            expect((repo as any).providers.get(provider.provide)).to.equal(overwritingProvider);

        });

        it('registers an array of providers when the multi option is set', () => {

            provider.multi = true;
            repo.register(provider);
            const additionalProvider = {
                provide: provider.provide,
                useValue: {},
                multi: true,
            };
            repo.register(additionalProvider);

            expect((repo as any).providers).to.contain.keys(provider.provide);
            expect((repo as any).providers.get(provider.provide)).to.deep.equal([
                provider,
                additionalProvider,
            ]);

        });

        it('throws an error when registering a multi provider if a non-multi provider already exists', () => {

            repo.register(provider);
            const additionalProvider = {
                provide: provider.provide,
                useValue: {},
                multi: true,
            };
            expect(() => repo.register(additionalProvider)).to.throw(ConflictingRegistrationOptionsError);

        });

        it('throws an error when registering a non-multi provider if a multi provider already exists', () => {

            const additionalProvider = {
                provide: provider.provide,
                useValue: {},
                multi: true,
            };
            repo.register(additionalProvider);
            expect(() => repo.register(provider)).to.throw(ConflictingRegistrationOptionsError);

        });

    });

    describe('get', () => {

        it('returns the provider for the specified token', () => {

            repo.register(provider);

            expect(repo.get(provider.provide)).to.equal(provider);

        });

        it('returns undefined if there is no registered provider for the token', () => {

            expect(repo.get(provider.provide)).to.be.undefined;

        });

    });

    describe('entries', () => {

        it('returns an iterator that iterates over all registered providers', () => {

            repo.register(provider);
            const anotherProvider = {
                provide: new SymbolToken('another-test'),
                useValue: {},
            };
            repo.register(anotherProvider);

            expect([...repo.entries()]).to.include.members([provider, anotherProvider]);

        });

    });

    describe('addSingleton', () => {

        it('adds the value to the singletons set', () => {
            repo.addSingleton(provider, value);
            expect((repo as any).singletons.get(provider)).to.equal(value);
        });

        it('throws an error if called without a valid provider', () => {
            expect(() => repo.addSingleton({} as any, value)).to.throw(ProviderTypeError);
        });

    });

    describe('getSingleton', () => {

        it('returns the value of a registered singleton', () => {
            repo.addSingleton(provider, value);
            expect(repo.getSingleton(provider)).to.equal(value);
        });

    });

    describe('dispose', () => {

        it('throws an error if called on the global repository', () => {
            expect(() => Repository.global.dispose('test')).to.throw(InvalidDisposeTargetError);
        });

        it('clears local maps', () => {

            const clearProviders = spy((repo as any).providers, 'clear');
            const clearSingletons = spy((repo as any).singletons, 'clear');

            repo.dispose('test');

            expect(clearProviders).to.have.been.calledOnce;
            expect(clearSingletons).to.have.been.calledOnce;

        });

        it('removes the repository from the REPOSITORIES map', () => {

            repo.dispose('test');

            // can't access REPOSITORIES, so just test to make sure the same repo isn't returned after it's
            // supposed to be removed
            expect(Repository.for('test')).not.to.equal(repo);

        });

    });

    describe('for', () => {

        it('instantiates a repository with the specified context', () => {
            expect((repo as any).context).to.equal('test');
        });

        it('returns an existing repository when the same context is used', () => {
            expect(Repository.for('test')).to.equal(repo);
        });

        it('throws an error if a context is not specified', () => {
            expect(() => Repository.for(null)).to.throw(InvalidRepositoryContextError);
        })

    });

});
