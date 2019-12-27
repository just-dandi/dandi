import { Disposable, InvalidDisposeTargetError } from '@dandi/common'
import {
  Injectable,
  ModuleBuilder,
  OpinionatedProviderOptionsConflictError,
  OpinionatedToken,
  Provider,
  ProviderTypeError,
  Registerable,
  SymbolToken,
} from '@dandi/core'
import {
  ConflictingRegistrationOptionsError, GLOBAL_CONTEXT,
  InvalidRegistrationTargetError,
  InvalidRepositoryContextError,
  Repository,
} from '@dandi/core/internal'

import { expect } from 'chai'
import { spy } from 'sinon'

describe('Repository', function() {

  class TestClass {}

  let repo: Repository
  let token: SymbolToken<any>
  let value: any
  let provider: Provider<any>

  beforeEach(function() {
    repo = Repository.for(Math.random())
    token = new SymbolToken<any>('test')
    value = {}
    provider = {
      provide: token,
      useValue: value,
    }
  })

  afterEach(() => {
    repo = undefined
    token = undefined
    value = undefined
    provider = undefined
  })

  describe('register', function() {
    it('sets ProviderOptions from an OpinionatedToken', function() {
      const token = new OpinionatedToken('test-op', { multi: true })
      const provider = {
        provide: token,
        useFactory: () => value,
      }
      repo.register(this, provider)
      expect((provider as any).multi).to.be.true
    })

    it('throw an error if ProviderOptions from an OpinionatedToken conflict with the provider', function() {
      const token = new OpinionatedToken('test-op', { multi: true })
      const provider = {
        provide: token,
        useFactory: () => value,
        multi: false,
      }
      expect(() => repo.register(this, provider)).to.throw(OpinionatedProviderOptionsConflictError)
    })

    it('registers a provider by its injection token', function() {
      repo.register(this, provider)

      expect((repo as any).providers).to.contain.keys(provider.provide)
      expect((repo as any).providers.get(provider.provide)).to.equal(provider)
    })

    it('registers a class using the class as the injection token if no token is specified in the options', function() {
      repo.register(this, TestClass)

      expect((repo as any).providers).to.contain.keys(TestClass)
      expect((repo as any).providers.get(TestClass)).to.deep.equal({
        provide: TestClass,
        useClass: TestClass,
      })
    })

    it('registers a class using the injection token specified in the options, if specified, as well as the class itself', function() {
      repo.register(this, TestClass, { provide: token })

      expect((repo as any).providers).to.contain.keys(token)
      // expect((repo as any).providers).to.contain.keys(TestClass);
      expect((repo as any).providers.get(token)).to.deep.equal({
        provide: token,
        useClass: TestClass,
      })
    })

    it('registers a class using the injection token specified in the options, if specified, as well as the class itself, unless the noSelf option is specified', function() {
      repo.register(this, TestClass, { provide: token, noSelf: true })

      expect((repo as any).providers).to.contain.keys(token)
      expect((repo as any).providers).not.to.contain.keys(TestClass)
      expect((repo as any).providers.get(token)).to.deep.equal({
        provide: token,
        useClass: TestClass,
        noSelf: true,
      })
    })

    it('leaves the multi and singleton options undefined if they are not specified', function() {
      repo.register(this, TestClass, { provide: token })

      expect((repo as any).providers.get(token).multi).to.be.undefined
      expect((repo as any).providers.get(token).singleton).to.be.undefined
    })

    it('throws an error if the registration target is not a class or provider', function() {
      expect(() => repo.register(this, null)).to.throw(InvalidRegistrationTargetError)
      expect(() => repo.register(this, undefined)).to.throw(InvalidRegistrationTargetError)
      expect(() => repo.register(this, {} as any)).to.throw(InvalidRegistrationTargetError)
    })

    it('includes the path of registration sources when throwing an InvalidRegistrationTargetError', function() {

      const source = {
        constructor: function TheTest() {},
        tag: '.theSpec',
        parent: {
          constructor: function RootSource() {},
        },
      }
      expect(() => repo.register(source, undefined)).to.throw(
        InvalidRegistrationTargetError,
        `Invalid Registration Target 'undefined' specified by RootSource -> TheTest.theSpec`,
      )

    })

    it('includes ModuleInfo in the path of registration sources if available', function() {

      @Injectable()
      class TestService {}

      class TestModuleBuilder extends ModuleBuilder<TestModuleBuilder> {
        constructor(...entries: Registerable[]) {
          super(TestModuleBuilder, `@dandi/core/test`, ...entries)
        }
      }

      new TestModuleBuilder(TestService)

      const source = {
        constructor: TestService,
        tag: '.theSpec',
        parent: {
          constructor: function RootSource() {},
        },
      }
      expect(() => repo.register(source, undefined)).to.throw(
        InvalidRegistrationTargetError,
        `Invalid Registration Target 'undefined' specified by RootSource -> (@dandi/core/test#TestModule):TestService.theSpec`,
      )

    })

    it('overwrites registrations when the multi option is not set', function() {
      repo.register(this, provider)
      const overwritingProvider = {
        provide: provider.provide,
        useValue: {},
      }
      repo.register(this, overwritingProvider)

      expect((repo as any).providers).to.contain.keys(provider.provide)
      expect((repo as any).providers.get(provider.provide)).to.equal(overwritingProvider)
    })

    it('registers an array of providers when the multi option is set', function() {
      provider.multi = true
      repo.register(this, provider)
      const additionalProvider = {
        provide: provider.provide,
        useValue: {},
        multi: true,
      }
      repo.register(this, additionalProvider)

      expect((repo as any).providers).to.contain.keys(provider.provide)
      expect([...(repo as any).providers.get(provider.provide)]).to.deep.equal([provider, additionalProvider])
    })

    it('throws an error when registering a multi provider if a non-multi provider already exists', function() {
      repo.register(this, provider)
      const additionalProvider = {
        provide: provider.provide,
        useValue: {},
        multi: true,
      }
      expect(() => repo.register(this, additionalProvider)).to.throw(ConflictingRegistrationOptionsError)
    })

    it('throws an error when registering a non-multi provider if a multi provider already exists', function() {
      const additionalProvider = {
        provide: provider.provide,
        useValue: {},
        multi: true,
      }
      repo.register(this, additionalProvider)
      expect(() => repo.register(this, provider)).to.throw(ConflictingRegistrationOptionsError)
    })
  })

  describe('get', function() {
    it('returns the provider for the specified token', function() {
      repo.register(this, provider)

      expect(repo.get(provider.provide)).to.equal(provider)
    })

    it('returns undefined if there is no registered provider for the token', function() {
      expect(repo.get(provider.provide)).to.be.undefined
    })
  })

  describe('entries', function() {
    it('returns an iterator that iterates over all registered providers', function() {
      repo.register(this, provider)
      const anotherProvider = {
        provide: new SymbolToken('another-test'),
        useValue: {},
      }
      repo.register(this, anotherProvider)

      expect([...repo.entries()]).to.include.members([provider, anotherProvider])
    })
  })

  describe('addSingleton', function() {
    it('adds the value to the singletons set', function() {
      Disposable.use(Repository.for({}), (repo) => {
        repo.addSingleton(provider, value)
        expect((repo as any).singletons.get(provider)).to.equal(value)
      })
    })

    it('throws an error if called without a valid provider', function() {
      Disposable.use(Repository.for({}), (repo) => {
        expect(() => repo.addSingleton({} as any, value)).to.throw(ProviderTypeError)
      })
    })
  })

  describe('getSingleton', function() {
    it('returns the value of a registered singleton', function() {
      Disposable.use(Repository.for({}), (repo) => {
        repo.addSingleton(provider, value)
        expect(repo.getSingleton(provider)).to.equal(value)
      })
    })
  })

  describe('dispose', function() {
    it('throws an error if called on the global repository', function() {
      const globalRepo = Repository.for(GLOBAL_CONTEXT)
      expect(() => globalRepo.dispose('test')).to.throw(InvalidDisposeTargetError)
    })

    it('clears local maps', function() {
      const clearProviders = spy((repo as any).providers, 'clear')
      const clearSingletons = spy((repo as any).singletons, 'clear')

      repo.dispose('test')

      expect(clearProviders).to.have.been.calledOnce
      expect(clearSingletons).to.have.been.calledOnce
    })

    it('removes the repository from the REPOSITORIES map', function() {
      repo.dispose('test')

      // can't access REPOSITORIES, so just test to make sure the same repo isn't returned after it's
      // supposed to be removed
      expect(Repository.for('test')).not.to.equal(repo)
    })
  })

  describe('for', function() {
    it('instantiates a repository with the specified context', function() {
      const localRepo = Repository.for('foo')
      expect((localRepo as any).context).to.equal('foo')
      localRepo.dispose('done')
    })

    it('returns an existing repository when the same context is used', function() {
      const localRepo = Repository.for('foo')
      expect(Repository.for('foo')).to.equal(localRepo)

      localRepo.dispose('done')
    })

    it('throws an error if a context is not specified', function() {
      expect(() => Repository.for(null)).to.throw(InvalidRepositoryContextError)
    })
  })
})
