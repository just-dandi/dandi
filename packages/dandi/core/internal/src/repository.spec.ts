import { Disposable, InvalidDisposeTargetError } from '@dandi/common'
import {
  Injectable,
  InjectionTokenTypeError,
  ModuleBuilder,
  OpinionatedProviderOptionsConflictError,
  OpinionatedToken,
  Provider,
  Registerable,
  RegistrationSource,
  SymbolToken,
} from '@dandi/core'
import {
  ConflictingRegistrationOptionsError,
  GLOBAL_SCOPE,
  InvalidRegistrationTargetError,
  InvalidRepositoryScopeError,
  Repository,
} from '@dandi/core/internal'

import { expect } from 'chai'
import { spy } from 'sinon'

describe('Repository', () => {
  class TestClass {}

  let source: RegistrationSource
  let repo: Repository
  let token: SymbolToken<any>
  let value: any
  let provider: Provider<any>

  beforeEach(() => {
    source = { constructor: function RepositorySpec() {} }
    repo = Repository.for(Math.random().toString())
    token = new SymbolToken<any>('test')
    value = {}
    provider = {
      provide: token,
      useValue: value,
    }
  })

  afterEach(() => {
    source = undefined
    repo = undefined
    token = undefined
    value = undefined
    provider = undefined
  })

  describe('register', () => {
    it('sets ProviderOptions from an OpinionatedToken', () => {
      const token = new OpinionatedToken('test-op', { multi: true })
      const provider = {
        provide: token,
        useFactory: () => value,
      }
      repo.register(this, provider)
      expect((provider as any).multi).to.be.true
    })

    it('throw an error if ProviderOptions from an OpinionatedToken conflict with the provider', () => {
      const token = new OpinionatedToken('test-op', { multi: true })
      const provider = {
        provide: token,
        useFactory: () => value,
        multi: false,
      }
      expect(() => repo.register(this, provider)).to.throw(OpinionatedProviderOptionsConflictError)
    })

    it('registers a provider by its injection token', () => {
      repo.register(source, provider)

      expect(repo.get(provider.provide)).to.equal(provider)
    })

    it('registers a class using the class as the injection token if no token is specified in the options', () => {
      repo.register(source, TestClass)

      expect(repo.get(TestClass)).to.deep.equal({
        provide: TestClass,
        useClass: TestClass,
      })
    })

    it('registers a class using the injection token specified in the options, if specified, as well as the class itself', () => {
      repo.register(this, TestClass, { provide: token })

      expect(repo.get(token)).to.deep.equal({
        provide: token,
        useClass: TestClass,
      })
      expect(repo.get(TestClass)).to.deep.equal({ provide: TestClass, useClass: TestClass })
    })

    it('registers a class using the injection token specified in the options, if specified, as well as the class itself, unless the noSelf option is specified', () => {
      repo.register(this, TestClass, { provide: token, noSelf: true })

      expect(repo.get(TestClass)).to.be.undefined
      expect(repo.get(token)).to.deep.equal({
        provide: token,
        useClass: TestClass,
        noSelf: true,
      })
    })

    it('leaves the multi option undefined if it is not specified', () => {
      repo.register(this, TestClass, { provide: token })

      const entry = repo.get(token) as Provider<any>
      expect(entry.multi).to.be.undefined
    })

    it('throws an error if the registration target is not a class or provider', () => {
      expect(() => repo.register(this, null)).to.throw(InvalidRegistrationTargetError)
      expect(() => repo.register(this, undefined)).to.throw(InvalidRegistrationTargetError)
      expect(() => repo.register(this, {} as any)).to.throw(InvalidRegistrationTargetError)
    })

    it('includes the path of registration sources when throwing an InvalidRegistrationTargetError', () => {
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

    it('includes ModuleInfo in the path of registration sources if available', () => {
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

    it('overwrites registrations when the multi option is not set', () => {
      repo.register(this, provider)
      const overwritingProvider = {
        provide: provider.provide,
        useValue: {},
      }
      repo.register(this, overwritingProvider)

      expect(repo.get(provider.provide)).to.equal(overwritingProvider)
    })

    it('registers an array of providers when the multi option is set', () => {
      provider.multi = true
      repo.register(this, provider)
      const additionalProvider = {
        provide: provider.provide,
        useValue: {},
        multi: true,
      }
      repo.register(this, additionalProvider)

      expect([...(repo.get(provider.provide) as Set<Provider<any>>)]).to.deep.equal([provider, additionalProvider])
    })

    it('throws an error when registering a multi provider if a non-multi provider already exists', () => {
      repo.register(this, provider)
      const additionalProvider = {
        provide: provider.provide,
        useValue: {},
        multi: true,
      }
      expect(() => repo.register(this, additionalProvider)).to.throw(ConflictingRegistrationOptionsError)
    })

    it('throws an error when registering a non-multi provider if a multi provider already exists', () => {
      const additionalProvider = {
        provide: provider.provide,
        useValue: {},
        multi: true,
      }
      repo.register(this, additionalProvider)
      expect(() => repo.register(this, provider)).to.throw(ConflictingRegistrationOptionsError)
    })
  })

  describe('get', () => {
    it('returns the provider for the specified token', () => {
      repo.register(this, provider)

      expect(repo.get(provider.provide)).to.equal(provider)
    })

    it('returns undefined if there is no registered provider for the token', () => {
      expect(repo.get(provider.provide)).to.be.undefined
    })
  })

  describe('providers', () => {
    it('returns an iterator that iterates over all registered providers', () => {
      repo.register(this, provider)
      const anotherProvider = {
        provide: new SymbolToken('another-test'),
        useValue: {},
      }
      repo.register(this, anotherProvider)

      expect([...repo.providers]).to.include.members([provider, anotherProvider])
    })
  })

  describe('addInstance', () => {
    it('adds the value to the instances set', () => {
      Disposable.use(Repository.for(Math.random().toString()), (repo) => {
        repo.addInstance(provider.provide, value)
        expect(repo.getInstance(provider)).to.equal(value)
      })
    })

    it('throws an error if called without a valid provider', () => {
      Disposable.use(Repository.for(Math.random().toString()), (repo) => {
        expect(() => repo.addInstance({} as any, value)).to.throw(InjectionTokenTypeError)
      })
    })
  })

  describe('getSingleton', () => {
    it('returns the value of a registered singleton', () => {
      Disposable.use(Repository.for(Math.random().toString()), (repo) => {
        repo.addInstance(provider.provide, value)
        expect(repo.getInstance(provider)).to.equal(value)
      })
    })
  })

  describe('dispose', () => {
    it('throws an error if called on the global repository', () => {
      const globalRepo = Repository.for(GLOBAL_SCOPE)
      expect(globalRepo.dispose('test')).to.be.rejectedWith(InvalidDisposeTargetError)
    })

    it('clears local maps', async () => {
      repo.register(source, provider)
      repo.addInstance(provider.provide, {})
      const clearProviders = spy((repo as any).registry, 'clear')
      const clearInstances = spy((repo as any).instances, 'clear')

      await repo.dispose('test')

      expect(clearProviders).to.have.been.calledOnce
      expect(clearInstances).to.have.been.calledOnce
    })

    it('removes the repository from the REPOSITORIES map', async () => {
      await repo.dispose('test')

      // can't access REPOSITORIES, so just test to make sure the same repo isn't returned after it's
      // supposed to be removed
      expect(Repository.for('test')).not.to.equal(repo)
    })
  })

  describe('for', () => {
    it('instantiates a repository with the specified context', () => {
      const localRepo = Repository.for('foo')
      expect((localRepo as any).scope).to.equal('foo')
      localRepo.dispose('done')
    })

    it('returns an existing repository when the same context is used', () => {
      const localRepo = Repository.for('foo')
      expect(Repository.for('foo')).to.equal(localRepo)

      localRepo.dispose('done')
    })

    it('throws an error if a context is not specified', () => {
      expect(() => Repository.for(null)).to.throw(InvalidRepositoryScopeError)
    })
  })
})
