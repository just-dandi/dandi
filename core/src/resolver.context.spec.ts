import { expect }    from 'chai';
import { spy, stub } from 'sinon';

import { InjectionToken, Provider, Repository, SymbolToken } from '../';

import { ResolverContext } from './resolver.context';

const chaiInspect = Symbol.for('chai/inspect');

describe('ResolverContext', () => {

    function provider<T, TProvider extends Provider<T>>(obj: TProvider): TProvider {
        obj[chaiInspect] = () => `Provider[provide: ${obj.provide}]`;
        return obj;
    }

    let parentRepo1: Repository;
    let parentRepo2: Repository;
    let parentToken1: InjectionToken<any>;
    let parentToken2: InjectionToken<any>;
    let childToken1: InjectionToken<any>;
    let childToken2: InjectionToken<any>;
    let parentValue1: any;
    let parentValue2: any;
    let childValue1: any;
    let childValue2: any;
    let parentProvider1: Provider<any>;
    let parentProvider2: Provider<any>;
    let childProvider1: Provider<any>;
    let childProvider2: Provider<any>;
    let parentContext: ResolverContext<any>;
    let childContext: ResolverContext<any>;

    beforeEach(() => {
        parentRepo1 = Repository.for('test-parent1');
        parentRepo2 = Repository.for('test-parent2');
        parentToken1 = new SymbolToken('test-parent1');
        parentToken2 = new SymbolToken('test-parent2');
        childToken1 = new SymbolToken('test-child1');
        childToken2 = new SymbolToken('test-child2');
        parentValue1 = {};
        parentValue2 = {};
        childValue1 = {};
        childValue2 = {};
        parentProvider1 = provider({
            provide: parentToken1,
            useValue: parentValue1,
        });
        parentProvider2 = provider({
            provide: parentToken2,
            useValue: parentValue2,
        });
        childProvider1 = provider({
            provide: childToken1,
            useValue: childValue1,
        });
        childProvider2 = provider({
            provide: childToken2,
            useValue: childValue2,
        });
        parentRepo1.register(parentProvider1);
        parentRepo2.register(parentProvider2);
        parentContext = ResolverContext.create(parentToken1, null, parentRepo1, parentRepo2);
        childContext = parentContext.childContext(childToken1, null, childProvider1, childProvider2);
    });

    afterEach(() => {
        parentRepo1 = undefined;
        parentRepo2 = undefined;
        parentToken1 = undefined;
        parentToken2 = undefined;
        childToken1 = undefined;
        childToken2 = undefined;
        parentValue1 = undefined;
        parentValue2 = undefined;
        childValue1 = undefined;
        childValue2 = undefined;
        parentProvider1 = undefined;
        parentProvider2 = undefined;
        childProvider1 = undefined;
        childProvider2 = undefined;
        parentContext = undefined;
        childContext = undefined;
    });

    describe('create', () => {

        it('returns an instance of ResolveContext', () => {
            expect(parentContext).to.exist;
            expect(parentContext).to.be.instanceOf(ResolverContext);
        });

        it('includes the specified repositories', () => {
            expect((parentContext as any).repositories).to.include(parentRepo1);
            expect((parentContext as any).repositories).to.include(parentRepo2);
        });

        it('sorts the repositories in order of precedence (reverse of defined order, like Object.assign)', () => {

            // note: slice(1) because the context adds its own repository to the front of the array
            expect((parentContext as any).repositories.slice(1)).to.deep.equal([
                parentRepo2,
                parentRepo1,
            ]);
        });

    });

    describe('context', () => {

        it('creates a ResolveContext instance that is a child of the call target', () => {

            expect((childContext as any).parent).to.equal(parentContext);

        });

        it('creates a new repository containing any specified providers', () => {

            expect((childContext as any).repositories.length).to.equal(1);
            expect((childContext as any).repositories[0].providers).to.include.keys(childToken1);
            expect((childContext as any).repositories[0].providers).to.include.keys(childToken2);

        });

        it('adds the child context to its array of children', () => {
            expect((parentContext as any).children).to.include(childContext);
        });

    });

    describe('addInstance', () => {
        it('adds the instance', () => {
            parentContext.addInstance(parentValue1);
            expect((parentContext as any).instances).to.deep.equal([parentValue1]);
        });
    });

    describe('match', () => {

        it('returns null if no token is found', () => {
            expect(ResolverContext.create(new SymbolToken('test')).match).to.be.null;
        });

        it('returns the entry if one is found', () => {
            expect(parentContext.match).to.equal(parentProvider1);
        });

        xit('returns the first matching entry when multiple repositories are specified', () => {
            expect(parentContext.match).to.equal(parentProvider1);
            expect(parentContext.match).to.equal(parentProvider2);
        });

        it('returns the first match entry when the same token is defined in multiple repositories', () => {

            const overridingValue = {};
            const overridingProvider = provider({
                provide: parentToken1,
                useValue: overridingValue,
            });
            parentRepo2.register(overridingProvider);

            expect(parentContext.match).to.equal(overridingProvider);

        });

        it('returns the first match entry when the same token is defined in a child context', () => {

            const overridingValue = {};
            const overridingProvider = provider({
                provide: parentToken1,
                useValue: overridingValue,
            });
            const overridingContext = childContext.childContext(parentToken1, null, overridingProvider);

            expect(overridingContext.match).to.equal(overridingProvider);

        });

        it('caches find results', () => {

            const doFind = spy(childContext as any, 'doFind');

            const result1 = childContext.match;
            const result2 = childContext.match;

            expect(doFind).to.have.been.calledOnce;
            expect(result1).to.equal(result2);

        });

        xit('finds entries only available in parent contexts', () => {

            const parentCachedFind = spy(parentContext as any, 'cachedFind');

            expect(
                (childContext as any).repositories[0].providers.get(parentToken1),
                'sanity check: token was found in child context repo'
            ).to.be.undefined;

            expect(childContext.match).to.equal(parentProvider1);
            expect(parentCachedFind).to.have.been.called;

        });

    });

    describe('addSingleton', () => {
        it('adds the value to the singletons map of the repository where the provider was found', () => {

            childContext.addSingleton(parentProvider1, parentValue1);

            expect(
                (childContext as any).repositories[0].singletons.get(parentProvider1),
                'singleton was found on the wrong repository'
            ).to.be.undefined;

            expect(
                (parentContext as any).repositories[0].singletons.get(parentProvider1),
                'singleton was found on the wrong repository'
            ).to.be.undefined;

            // NOTE: index 2 because ResolverContext adds its own Repository to the front of the array
            expect(
                (parentContext as any).repositories[2].singletons.get(parentProvider1),
                'singleton was not found on the expected repository'
            ).to.equal(parentValue1);

        });
    });

    describe('getSingleton', () => {
        it('gets the singleton value from the repository where the provider was found', () => {

            childContext.addSingleton(parentProvider1, parentValue1);

            expect(childContext.getSingleton(parentProvider1)).to.equal(parentValue1);

        });
    });

    describe('resolve', () => {

        it('sets the `result` property with a ResolveResult instance containing the value', () => {
            parentContext.resolveValue(parentValue1);
            expect(parentContext.result).to.have.property('value', parentValue1);
        });

    });

    describe('dispose', () => {

        it('clears local arrays/sets/maps', () => {

            childContext.addInstance(childValue1);
            childContext.match;
            childContext.childContext(childToken1, null);

            expect((childContext as any).children).not.to.be.empty;
            expect((childContext as any).instances).not.to.be.empty;
            expect((childContext as any).findCache).not.to.be.empty;

            childContext.dispose('test');

            expect(() => (childContext as any).children).to.throw;
            expect(() => (childContext as any).instances).to.throw;
            expect(() => (childContext as any).findCache).to.throw;

        });

        it('disposes all disposable instances', () => {

            const childInstanceDispose = stub();
            childContext.addInstance({ dispose: childInstanceDispose });

            childContext.dispose('test');

            expect(childInstanceDispose).to.have.been.calledOnce;

        });

        it('disposes all child contexts', () => {

            const childDispose = spy(childContext, 'dispose');

            parentContext.dispose('test');

            expect(childDispose).to.have.been.calledOnce;

        });

    });

});
