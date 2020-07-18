import { LogLevel } from '@dandi/core'
import { ContextualLogger, LogStreamSubject } from '@dandi/core/logging'

import { expect } from 'chai'
import { createStubInstance } from 'sinon'

describe('ContextualLogger', function () {
  beforeEach(function () {
    this.ts = new Date().valueOf()
    this.stream = createStubInstance(LogStreamSubject)
    this.now = this.sandbox.stub().returns(this.ts)
    this.logger = new ContextualLogger(this.stream, 'test', this.now)
  })

  const checkLevel = (level: LogLevel): void => {
    describe(level.toString(), function () {
      it('calls next() on the LogStream instance with a LogEntry object', function () {
        this.logger[level]('test message')

        expect(this.stream.next).to.have.been.calledOnce.calledWithExactly({
          level,
          ts: this.ts,
          context: 'test',
          args: ['test message'],
          options: {},
        })
      })
    })
  }

  Object.keys(LogLevel).forEach(checkLevel)
})
