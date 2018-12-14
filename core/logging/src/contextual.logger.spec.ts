import { LogLevel } from '@dandi/core'
import { ContextualLogger, LogStreamSubject } from '@dandi/core/logging'

import { expect } from 'chai'
import { createStubInstance } from 'sinon'

describe('ContextualLogger', function() {

  beforeEach(function() {
    this.ts = new Date().valueOf()
    this.stream = createStubInstance(LogStreamSubject)
    this.now = this.sandbox.stub().returns(this.ts)
    this.logger = new ContextualLogger(this.stream, 'test', this.now)
  })

  describe('#log', function() {

    it('calls next() on the LogStream instance with a LogEntry object', function() {

      this.logger.log(LogLevel.info, 'test message')

      expect(this.stream.next).to.have.been
        .calledOnce
        .calledWithExactly({
          level: LogLevel.info,
          ts: this.ts,
          context: 'test',
          args: ['test message'],
        })

    })

  })

})
