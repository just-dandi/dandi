import { AppError, Constructor } from '@dandi/common';
import * as util from 'util';

import { getTokenString, InjectionToken } from './injection.token';
import { localSymbolToken }               from './local.token';
import { ResolverContext }                from './resolver.context';

export interface InjectionOptions {
    multi?: boolean;
    singleton?: boolean;
}

export interface ProviderOptions<T> extends InjectionOptions {
    provide?: InjectionToken<T>;
}

export const ProviderOptions = localSymbolToken<ProviderOptions<any>>('ProviderOptions');

export interface ValueProvider<T> extends ProviderOptions<T> {
    provide: InjectionToken<T>;
    useValue: T;
}

export interface GeneratorProvider<T> extends ProviderOptions<T> {
    provide: InjectionToken<T>;
    providers?: Provider<any>[];
}

export interface SyncFactoryProvider<T> extends GeneratorProvider<T> {
    useFactory: (...args: any[]) => T;
    async?: false;
    deps?: InjectionToken<any>[];
}

export interface AsyncFactoryProvider<T> extends GeneratorProvider<T> {
    useFactory: (...args: any[]) => Promise<T>;
    async: true,
    deps?: InjectionToken<any>[];
}

export type FactoryProvider<T> = SyncFactoryProvider<T> | AsyncFactoryProvider<T>;

export interface ClassProvider<T> extends GeneratorProvider<T> {
    useClass: Constructor<T>;
}

export type Provider<T> = ClassProvider<T> | FactoryProvider<T> | ValueProvider<T> | AsyncFactoryProvider<T>;
export type GeneratingProvider<T> = ClassProvider<T> | FactoryProvider<T> | AsyncFactoryProvider<T>;
export type MultiProvider<T> = Provider<T> & { multi: true };

export class ProviderTypeError extends AppError {
    constructor(public readonly target: any) {
        super('Specified object is not a valid provider');
    }
}

export class MissingProviderError<T> extends AppError {
    constructor(public readonly token: InjectionToken<T>, private context: ResolverContext<T>) {
        super(`No provider for ${getTokenString(token)} while resolving ${context[util.inspect.custom]()}`);
    }

    [util.inspect.custom](): string {
        return this.context[util.inspect.custom]();
    }
}
