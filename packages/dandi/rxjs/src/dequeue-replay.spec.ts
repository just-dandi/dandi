import { expect } from 'chai'
import { EMPTY, NEVER, Observable } from 'rxjs'

import { dequeueReplay } from './dequeue-replay'

/** @test {dequeueReplay} */
describe.marbles('dequeueReplay operator', ({ cold }) => {
  it('should emit only values that have not been dequeued for subsequent subscribers', () => {
    const source = cold('-a-b--------')
    const dequeue = cold('----b')
    const dequeueSub = '-^'
    const sub1 = '^---'
    const sub1Expected = '-a-b'
    const sub2 = '------^-'
    const sub2Expected = '------a'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeue).to.be.subscribedWith(dequeueSub)

    expect(dequeueTest).with.subscription(sub1).to.equal(sub1Expected)
    expect(dequeueTest).with.subscription(sub2).to.equal(sub2Expected)
  })

  it('should emit values to active subscribers as they are emitted from the source', () => {
    const dequeue = cold('-')
    const source = cold('-a-b-c|')
    const expected = '-a-b-c|'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).to.equal(expected)
  })

  it('should emit values to a new subscriber that were queued before its subscription', () => {
    const dequeue = cold('-')
    const source = cold('-a')
    const sub1 = '^---!'
    const sub1Expected = '-a'
    const sub2 = '----^!'
    const sub2Expected = '----a'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).with.subscription(sub1).to.equal(sub1Expected)
    expect(dequeueTest).with.subscription(sub2).to.equal(sub2Expected)
  })

  it('should emit multiple values queued before second subscription', () => {
    const dequeue = cold('-')
    const source = cold('-a-b')
    const sub1 = '^-!'
    const sub1Expected = '-a'
    const sub2 = '----^-!'
    const sub2Expected = '----(ab)'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).with.subscription(sub1).to.equal(sub1Expected)
    expect(dequeueTest).with.subscription(sub2).to.equal(sub2Expected)
  })

  it('should error when the source observable errors', () => {
    const dequeue = cold('-')
    const source = cold('-a-#')
    const expected = '-a-#'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).to.equal(expected)
  })

  it('should error when the dequeue observable errors', () => {
    const dequeue = cold('--#')
    const source = cold('-a')
    const expected = '-a-#'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).to.equal(expected)
  })

  it('should complete when there is a buffered value and both the source and dequeue observables complete', () => {
    const dequeue = cold('--|')
    const source = cold('-a|')
    const expected = '-a|'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).to.equal(expected)
  })

  it('should complete when the source observable completes', () => {
    const dequeue = cold('-')
    const source = cold('-a|')
    const expected = '-a|'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).to.equal(expected)
  })

  it('should remain subscribed to the dequeue trigger if the source completes, but there are buffered values', () => {
    const dequeue = cold('-')
    const dequeueSub = '-^'
    const source = cold('-a|')
    const expected = '-a|'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).to.equal(expected)
    expect(dequeue).to.have.been.subscribedWith(dequeueSub)
  })

  it(
    'should unsubscribe from the dequeue trigger when the source observable completes and all remaining buffered ' +
      'values are dequeued',
    () => {
      const dequeue = cold('---a')
      const dequeueSub = '-^--!'
      const source = cold('-a|')
      const expected = '-a|'

      const dequeueTest = source.pipe(dequeueReplay(dequeue))

      expect(dequeueTest).to.equal(expected)
      expect(dequeue).to.have.been.subscribedWith(dequeueSub)
    },
  )

  it('should not emit any values and complete with an empty source', () => {
    const dequeue = EMPTY
    const source = EMPTY
    const expected = '|'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).to.equal(expected)
  })

  it('should not emit any values and never complete or error with a "never" source', () => {
    const dequeue = EMPTY
    const source = NEVER
    const expected = '-'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).to.equal(expected)
  })

  it('should always emit all values with a "never" dequeue source', () => {
    const dequeue = NEVER as Observable<string>
    const source = cold('a-b-c-d-e-f-g-h')
    const subA = '^'
    const expectedA = 'a-b-c-d-e-f-g-h'
    const subB = '---------------^'
    const expectedB = '---------------(abcdefgh)'
    const subC = '--------------------^'
    const expectedC = '--------------------(abcdefgh)'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).with.subscription(subA).to.equal(expectedA)
    expect(dequeueTest).with.subscription(subB).to.equal(expectedB)
    expect(dequeueTest).with.subscription(subC).to.equal(expectedC)
  })

  it('should always emit all values with an "empty" dequeue source', () => {
    const dequeue = EMPTY as Observable<string>
    const source = cold('a-b-c-d-e-f-g-h')
    const subA = '^'
    const expectedA = 'a-b-c-d-e-f-g-h'
    const subB = '---------------^'
    const expectedB = '---------------(abcdefgh)'
    const subC = '--------------------^'
    const expectedC = '--------------------(abcdefgh)'

    const dequeueTest = source.pipe(dequeueReplay(dequeue))

    expect(dequeueTest).with.subscription(subA).to.equal(expectedA)
    expect(dequeueTest).with.subscription(subB).to.equal(expectedB)
    expect(dequeueTest).with.subscription(subC).to.equal(expectedC)
  })
})
