import { LogEntry, LogLevel, OnConfig } from '@dandi/core'
import { ConsoleLogListener, LogStreamSubject } from '@dandi/core/logging'

import { expect } from 'chai'
import { createStubInstance } from 'sinon'

import { isFactoryProvider } from '../../src/provider-util'

import { LoggerConfig } from './logger.config'

describe('LoggerConfig', function() {

  it('subscribes all listeners to the provided stream', function() {
    const stream = createStubInstance(LogStreamSubject)
    const listeners = [createStubInstance(ConsoleLogListener), createStubInstance(ConsoleLogListener), createStubInstance(ConsoleLogListener)]

    if (isFactoryProvider(LoggerConfig)) {
      const config: OnConfig = LoggerConfig.useFactory(stream, listeners) as OnConfig
      config()

      expect(stream.subscribe.callCount).to.equal(3)

      listeners.forEach((listener, index) => {
        const subscriber = stream.subscribe.getCall(index).args[0]
        const entry: LogEntry = {
          level: LogLevel.info,
          context: 'test',
          ts: 0,
          args: [`foo${index}`],
        }
        subscriber(entry)
        expect(listener.log).to.have.been
          .calledOnce
          .calledWithExactly(entry)
      })
    } else {
      this.fail('expected a factory provider')
    }

  })

})
