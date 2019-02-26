import { InjectionContext, LogCallOptions, LogLevel } from '@dandi/core'
import { ConsoleLogListener, LogEntry } from '@dandi/core/logging'
import { DateTime } from 'luxon'

import { expect } from 'chai'

describe('ConsoleLogListener', function() {

  function entry(level: LogLevel, context?: InjectionContext, ts?: number, options: LogCallOptions = {}): (...args: any[]) => LogEntry {
    return (...args: any[]) => ({
      level,
      context,
      ts,
      args,
      options,
    })
  }

  beforeEach(function() {
    // IMPORTANT! these must be stubbed BEFORE instantiating the ConsoleLogger instance, otherwise it will bind to the real one
    this.debug = this.sandbox.stub(console, 'debug')
    this.info = this.sandbox.stub(console, 'info')
    this.warn = this.sandbox.stub(console, 'warn')
    this.error = this.sandbox.stub(console, 'error')
    this.config = {}
    this.logger = new ConsoleLogListener(this.config)
  })

  describe('log', function() {

    it('does not log filtered levels', function() {
      this.config.filter = LogLevel.warn
      this.logger.log({ level: LogLevel.debug, args: ['test'] })
      expect(console.debug).not.to.have.been.called
    })

    it('calls the debug method for debug level entries', function() {
      this.logger.log(entry(LogLevel.debug)('debug!'))
      expect(console.debug).to.have.been.calledOnce
    })

    it('short-circuits the tagging logic if the entry metadata disabled all tags', function() {
      this.sandbox.stub(this.logger, 'getContextName')

      this.logger.log({ level: LogLevel.debug, args: ['test'], options: { context: false, level: false, timestamp: false }})

      expect(this.logger.getContextName).not.to.have.been.called
      expect(console.debug).to.have.been
        .calledOnce
        .calledWithExactly('test')

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

    describe('with context', function() {

      beforeEach(function() {
        this.logger = new ConsoleLogListener({
          contextTag: true,
        })
      })

      it('correctly formats the log entry data', function() {
        const ts = new Date().valueOf()
        this.logger.log(entry(LogLevel.info, 'test', ts)('eyyy'))
        expect(console.info).to.have.been
          .calledOnce
          .calledWithExactly(`[INFO  ${ts} test]`, 'eyyy')
      })

      it('pads the context tag from the remaining arguments for increasingly long context tags', function() {
        const ts = new Date().valueOf()

        this.logger.log(entry(LogLevel.info, 'aaaa', ts)('eyyy'))
        expect(console.info).to.have.been.calledWithExactly(`[INFO  ${ts} aaaa]`, 'eyyy')
        this.info.reset()

        this.logger.log(entry(LogLevel.info, 'a', ts)('eyyy'))
        expect(console.info).to.have.been.calledWithExactly(`[INFO  ${ts} a]   `, 'eyyy')

      })
    })
  })

  describe('conditional tags and configuration', function() {

    beforeEach(function() {
      this.ts = new Date().valueOf()
      this.entry = {
        level: LogLevel.info,
        context: 'test-context',
        ts: this.ts,
        args: ['test message'],
        options: {},
      }
    })

    it('disabled context', function() {
      this.entry.options.context = false
      this.logger.log(this.entry)

      expect(console.info).to.have.been
        .calledOnce
        .calledWithExactly(`[INFO  ${this.ts}]`, 'test message')
    })

    it('disabled level', function() {
      this.entry.options.level = false
      this.logger.log(this.entry)

      expect(console.info).to.have.been
        .calledOnce
        .calledWithExactly(`[${this.ts} ${this.entry.context}]`, 'test message')

    })

    it('disabled timestamp', function() {
      this.entry.options.timestamp = false
      this.logger.log(this.entry)

      expect(console.info).to.have.been
        .calledOnce
        .calledWithExactly(`[INFO  ${this.entry.context}]`, 'test message')

    })

    it('custom timestamp tag', function() {
      this.config.timestampTag = 'yyyy'
      this.entry.options.context = false
      this.entry.options.level = false

      this.logger.log(this.entry)

      expect(console.info).to.have.been
        .calledOnce
        .calledWithExactly(`[${new Date(this.ts).getFullYear()}]`, 'test message')
    })

    it('custom timestamp formatter', function() {
      this.config.timestampTag = () => 'foo'
      this.entry.options.context = false
      this.entry.options.level = false

      this.logger.log(this.entry)

      expect(console.info).to.have.been
        .calledOnce
        .calledWithExactly(`[foo]`, 'test message')
    })

    it('custom timestamp format options', function() {
      this.config.timestampTag = DateTime.TIME_24_SIMPLE
      this.entry.options.context = false
      this.entry.options.level = false

      this.logger.log(this.entry)
      const time = new Date(this.ts)

      const hours = time
        .getHours()
        .toString()
        .padStart(2, '0')
      const minutes = time
        .getMinutes()
        .toString()
        .padStart(2, '0')

      expect(console.info).to.have.been
        .calledOnce
        .calledWithExactly(`[${hours}:${minutes}]`, 'test message')
    })

    it('custom tag formatter', function() {
      this.config.tag = () => `I won't do what you tell me`

      this.logger.log(this.entry)

      expect(console.info).to.have.been
        .calledOnce
        .calledWithExactly(`I won't do what you tell me`, 'test message')
    })

  })
})
