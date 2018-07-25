import { Injectable } from './injectable.decorator';
import { LogLevel }   from './log.level';
import { Logger }     from './logger';

@Injectable(Logger)
export class NoopLogger implements Logger {

    public log(level: LogLevel, ...args: any[]): void {
    }

    public debug(...args: any[]): void {
    }

    public info(...args: any[]): void {
    }

    public warn(...args: any[]): void {
    }

    public error(...args: any[]): void {
    }

}
