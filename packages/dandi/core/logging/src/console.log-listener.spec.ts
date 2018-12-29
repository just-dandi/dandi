import { InjectionContext, LogLevel } from '@dandi/core'
import { ConsoleLogListener, LogEntry } from '@dandi/core/logging'

import { expect } from 'chai'

describe('ConsoleLogListener', function() {

  function entry(level: LogLevel, context?: InjectionContext, ts?: number): (...args: any[]) => LogEntry {
    return (...args: any[]) => ({
      level,
      context,
      ts,
      args,
    })
  }

  beforeEach(function() {
    // IMPORTANT! these must be stubbed BEFORE instantiating the ConsoleLogger instance, otherwise it will bind to the real one
    this.debug = this.sandbox.stub(console, 'debug')
    this.info = this.sandbox.stub(console, 'info')
    this.warn = this.sandbox.stub(console, 'warn')
    this.error = this.sandbox.stub(console, 'error')
    this.logger = new ConsoleLogListener()
  })

  describe('log', function() {
    it('calls the debug method for debug level entries', function() {
      this.logger.log(entry(LogLevel.debug)('debug!'))
    })

    it('calls the info method for info level entries', function() {
      this.logger.log(entry(LogLevel.info)('info!'))
      expect(console.info).to.have.been.calledOnce
    })

    it('calls the warn method for warn level entries', function() {
      this.logger.log(entry(LogLevel.warn)('warn!'))
    })

    it('calls the error method for error level entries', function() {
      this.logger.log(entry(LogLevel.error)('error!'))
      expect(console.error).to.have.been.calledOnce
    })

    it('correctly formats the log entry data', function() {
      const ts = new Date().valueOf()
      this.logger.log(entry(LogLevel.info, 'test', ts)('eyyy'))
      expect(console.info).to.have.been
        .calledOnce
        .calledWithExactly(`[${ts} test]`, 'eyyy')
    })

    it('pads the context tag from the remaining arguments for increasingly long context tags', function() {
      const ts = new Date().valueOf()

      this.logger.log(entry(LogLevel.info, 'aaaa', ts)('eyyy'))
      expect(console.info).to.have.been.calledWithExactly(`[${ts} aaaa]`, 'eyyy')
      this.info.reset()

      this.logger.log(entry(LogLevel.info, 'a', ts)('eyyy'))
      expect(console.info).to.have.been.calledWithExactly(`[${ts} a]   `, 'eyyy')

    })
  })
})
