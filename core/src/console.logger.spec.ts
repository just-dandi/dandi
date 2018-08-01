import { expect } from 'chai';
import { SinonStub, stub } from 'sinon';

import { ConsoleLogger } from './console.logger';
import { LogLevel } from './log.level';

describe('ConsoleLogger', () => {
  let context: any;
  let logger: ConsoleLogger;
  let debug: SinonStub;
  let info: SinonStub;
  let warn: SinonStub;
  let error: SinonStub;

  beforeEach(() => {
    // IMPORTANT! these must be stubbed BEFORE instantiating the ConsoleLogger instance, otherwise it will bind to the real one
    debug = stub(console, 'debug');
    info = stub(console, 'info');
    warn = stub(console, 'warn');
    error = stub(console, 'error');
    context = 'test';
    logger = new ConsoleLogger(context);
  });
  afterEach(() => {
    debug.restore();
    info.restore();
    warn.restore();
    error.restore();
    context = undefined;
    logger = undefined;
  });

  describe('getContextTag', () => {
    it('returns the name of a class or function surrounded by brackets', () => {
      expect((logger as any).getContextTag(function foo() {} as any)).to.equal('[foo]');
    });

    it('returns the toString output of a non-class and non-function object surrounded by brackets', () => {
      const context = {
        toString() {
          return 'yeah man';
        },
      };
      expect((logger as any).getContextTag(context as any)).to.equal('[yeah man]');
    });
  });

  describe('logging functions', () => {
    it('prefixes calls to debug, info, warn, and error with the context', () => {
      logger.debug('debug!');
      expect(console.debug).to.have.been.calledOnce.calledWithExactly('[test]', 'debug!');

      logger.info('info!');
      expect(console.info).to.have.been.calledOnce.calledWithExactly('[test]', 'info!');

      logger.warn('warn!');
      expect(console.warn).to.have.been.calledOnce.calledWithExactly('[test]', 'warn!');

      logger.error('error!');
      expect(console.error).to.have.been.calledOnce.calledWithExactly('[test]', 'error!');
    });
  });

  describe('log', () => {
    it('calls the logging method specified by the logging level', () => {
      logger.log(LogLevel.debug, 'debug!');
      expect(console.debug).to.have.been.calledOnce.calledWithExactly('[test]', 'debug!');

      logger.log(LogLevel.info, 'info!');
      expect(console.info).to.have.been.calledOnce.calledWithExactly('[test]', 'info!');

      logger.log(LogLevel.warn, 'warn!');
      expect(console.warn).to.have.been.calledOnce.calledWithExactly('[test]', 'warn!');

      logger.log(LogLevel.error, 'error!');
      expect(console.error).to.have.been.calledOnce.calledWithExactly('[test]', 'error!');
    });
  });
});
