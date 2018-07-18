import * as Console from 'console';
import { SinonStub, stub } from 'sinon';

export type ConsoleMethodName = keyof Console;

export interface StubConsoleFn {
    (methods?: ConsoleMethodName[]): void;
    defaults: ConsoleMethodName[];
    all: ConsoleMethodName[];
}

function stubConsoleFn(methods: ConsoleMethodName[] = (stubConsoleFn as StubConsoleFn).defaults): void {
    if (!methods.length) {
        methods = (stubConsoleFn as StubConsoleFn).defaults;
    }
    beforeEach(function() {
        const test = this.currentTest;
        methods.forEach(method => stub(console, method).callsFake((...args) => {
            if (test.state) {
                // if the test has finished running, allow console messages through so that Mocha can log the results
                console.constructor.prototype.log.apply(console, args);
            }
        }));
    });
    afterEach(() => {
        methods.forEach(method => (console[method] as SinonStub).restore());
    });
}
(stubConsoleFn as StubConsoleFn).defaults = ['debug', 'log', 'info', 'warn'];
(stubConsoleFn as StubConsoleFn).all = (stubConsoleFn as StubConsoleFn).defaults.concat(['error']);

/**
 * Stubs the native `console` object so that console calls from tested objects don't pollute the test output.
 * Allows console calls through if the test has finished running.
 * @type {StubConsoleFn}
 */
export const stubConsole: StubConsoleFn = stubConsoleFn as StubConsoleFn;
