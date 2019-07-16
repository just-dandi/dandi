import { AsyncMutex, AsyncMutexLockAlreadyReleasedError, Disposable } from '@dandi/common'

import { expect } from 'chai'
import { stub } from 'sinon'

describe('AsyncMutex', function() {

  function waiter(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 5))
  }

  class TestObject implements Disposable {

    public get foo(): string {
      return 'bar'
    }

    public getFoo(): string {
      return this.foo
    }

    public dispose(): void | Promise<void> {
      return undefined
    }

  }

  beforeEach(function() {
    this.lockObject = new TestObject()
    stub(this.lockObject, 'dispose')
    this.mutex = AsyncMutex.for(this.lockObject)
  })
  afterEach(function() {
    this.mutex.dispose()
  })

  describe('for', function() {

    it('returns an AsyncMutex instance', function() {
      expect(this.mutex).to.exist
      expect(this.mutex).to.be.instanceof(AsyncMutex)
    })

    it('does not create duplicated instances for the same lock object', function() {
      expect(AsyncMutex.for(this.lockObject)).to.equal(this.mutex)
      expect(AsyncMutex.for(this.lockObject)).to.equal(AsyncMutex.for(this.lockObject))
    })

  })

  describe('getLock', function() {

    it('returns a lock object if no other locks are active', async function() {
      const lock = await this.mutex.getLock()
      expect(lock).to.exist
    })

    it('waits for a previous lock to be released if there is at least one active lock', async function() {
      const gotFirstLock = stub().returnsArg(0)
      const gotSecondLock = stub().returnsArg(0)
      const firstLockRequest = this.mutex.getLock().then(gotFirstLock)
      const secondLockRequest = this.mutex.getLock().then(gotSecondLock)

      const firstLock = await firstLockRequest
      expect(gotFirstLock).to.have.been.called
      expect(gotSecondLock).not.to.have.been.called

      firstLock.dispose('byeee')

      const secondLock = await secondLockRequest
      expect(gotSecondLock).to.have.been.called
      secondLock.dispose('byeee')

    })

    it('waits for the previous lock to be released if there are multiple pending locks', async function() {
      const gotFirstLock = stub().returnsArg(0)
      const gotSecondLock = stub().returnsArg(0)
      const gotThirdLock = stub().returnsArg(0)
      const firstLockRequest = this.mutex.getLock().then(gotFirstLock)
      const secondLockRequest = this.mutex.getLock().then(gotSecondLock)
      const thirdLockRequest = this.mutex.getLock().then(gotThirdLock)

      const firstLock = await firstLockRequest
      expect(gotFirstLock).to.have.been.called
      expect(gotSecondLock).not.to.have.been.called
      expect(gotThirdLock).not.to.have.been.called

      firstLock.dispose('byeee')

      const secondLock = await secondLockRequest
      expect(gotSecondLock).to.have.been.called
      expect(gotThirdLock).not.to.have.been.called
      secondLock.dispose('byeee')

      const thirdLock = await thirdLockRequest
      expect(gotThirdLock).to.have.been.called
      thirdLock.dispose('byeee')
    })

    describe('LockedObject', function() {

      beforeEach(async function() {
        this.lockedObject = await this.mutex.getLock()
      })

      it('allows properties of the original object to be called', function() {
        expect(this.lockedObject.foo).to.equal('bar')
      })

      it('allows methods of the original object to be called, maintaing the correct "this" object', function() {
        expect(this.lockedObject.getFoo()).to.equal('bar')
      })

      it('overrides the dispose method without calling the dispose method on the original object', async function() {
        await this.lockedObject.dispose()
        expect(this.lockObject.dispose).not.to.have.been.called
      })

      it('no longer allows access to the original object after disposal', async function() {
        await this.lockedObject.dispose()
        expect(() => this.lockedObject.getFoo).to.throw(AsyncMutexLockAlreadyReleasedError)
      })

      it('does not overwrite properties on the underlying lockObject', async function() {
        await this.lockedObject.dispose()
        expect(this.lockObject.getFoo).to.be.a('function')
      })

    })

  })

  describe('runLocked', function() {

    it('runs tasks in sequence', async function() {

      const stubA = stub()
      const stubB = stub()

      this.mutex.runLocked(() => waiter().then(stubA))
      const b = this.mutex.runLocked(() => waiter().then(stubB))

      await b
      expect(stubA).to.have.been.calledBefore(stubB)

    })

    it('runs several tasks in sequence', async function() {

      const stubs: any = {
        a: () => {},
        b: () => {},
        c: () => {},
        d: () => {},
      }
      stub(stubs, 'a')
      stub(stubs, 'b')
      stub(stubs, 'c')
      stub(stubs, 'd')

      this.mutex.runLocked(() => waiter().then(stubs.a))
      this.mutex.runLocked(() => waiter().then(stubs.b))
      this.mutex.runLocked(() => waiter().then(stubs.c))
      const d = this.mutex.runLocked(() => waiter().then(stubs.d))

      await d
      expect(stubs.a).to.have.been.calledBefore(stubs.b)
      expect(stubs.b).to.have.been.calledBefore(stubs.c)
      expect(stubs.c).to.have.been.calledBefore(stubs.d)

    })

    it('runs subsequent tasks if a previous task fails', async function() {

      const stubA = stub().throws()
      const stubB = stub()

      const a = this.mutex.runLocked(() => waiter().then(stubA))
      const b = this.mutex.runLocked(() => waiter().then(stubB))

      await expect(a).to.have.been.rejected
      await expect(b).to.have.been.fulfilled
      expect(stubB).to.have.been.called

    })

  })

})
