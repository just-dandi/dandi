import { Inject }           from './inject.decorator';
import { Injectable }       from './injectable.decorator';
import { InjectionContext } from './injection.context';
import { InjectionToken }   from './injection.token';
import { LogLevel }         from './log.level';
import { Logger, LoggerMethod } from './logger';

@Injectable(Logger)
export class ConsoleLogger implements Logger {

    private readonly contextTag: string;

    public readonly debug: LoggerMethod;
    public readonly info: LoggerMethod;
    public readonly warn: LoggerMethod;
    public readonly error: LoggerMethod;

    constructor(
        @Inject(InjectionContext) context: InjectionToken<any>,
    ) {
        this.contextTag = this.getContextTag(context);
        this.debug = console.debug.bind(console, this.contextTag);
        this.info = console.info.bind(console, this.contextTag);
        this.warn = console.warn.bind(console, this.contextTag);
        this.error = console.error.bind(console, this.contextTag);
    }

    public log(level: LogLevel, ...args: any[]): void {
        console[level](this.contextTag, ...args);
    }

    private getContextTag(context: InjectionToken<any>) {
        return `[${typeof context === 'function' ? context.name : context}]`;
    }

}
