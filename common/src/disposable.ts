import { AppError } from './app.error';

export type DisposeFn = (reason: string) => void;

export interface Disposable {
    dispose(reason: string): void;
    disposed?: boolean;
}

export class DisposableTypeError extends AppError {
    constructor(message?: string) {
        super(message);
    }
}

export class DisposableFunctionError extends AppError {
    constructor(message?: string) {
        super(message);
    }
}

export class InvalidDisposeTargetError extends AppError {
    constructor(message: string) {
        super(message);
    }
}

export class AlreadyDisposedError extends AppError {
    constructor(public readonly target: any, public readonly reason: string) {
        super(`The target has already been disposed and cannot be used: ${reason}`);
    }
}

function throwAlreadyDisposed(target: any, reason: string) {
    throw new AlreadyDisposedError(target, reason);
}

/**
 * Provides utility functions for working with {@see Disposable} objects.
 */
export class Disposable {

    /**
     * Returns {true} if the object implements {@see Disposable}; otherwise, {false}.
     */
    public static isDisposable(obj: any): obj is Disposable {
        return obj && typeof(obj.dispose) === 'function' || false;
    }

    /**
     * Modifies the specified object to add the provided {@see DisposeFn} as the {@see Disposable.dispose}
     * implementation. If the object already has a function member named {dispose}, it is wrapped and called
     * before the new function.
     */
    public static makeDisposable<T>(obj: T, dispose: DisposeFn): T & Disposable {

        if (!obj || typeof obj !== 'object') {
            throw new DisposableTypeError(`Cannot make ${obj} disposable`);
        }

        if (typeof dispose !== 'function') {
            throw new DisposableFunctionError('dispose must be a function');
        }

        if (!Disposable.isDisposable(obj)) {
            (obj as any).dispose = dispose;
            return obj as (T & Disposable);
        }

        const ogDispose = obj.dispose;
        obj.dispose = (reason: string) => {
            let ogError: Error;
            try { ogDispose(reason); }
            catch (err) {
                ogError = err;
            }
            finally { dispose(reason); }

            if (ogError) {
                throw ogError;
            }
        };
        return obj;

    }

    /**
     * Invokes the specified function, then disposes the object.
     */
    public static use<T extends Disposable, TResult = void>(obj: T, use: (obj: T) => TResult): TResult {
        let error: Error;
        try {
            return use(obj);
        }
        catch (err) {
            error = err;
        }
        finally {
            if (Disposable.isDisposable(obj)) {
                obj.dispose('after Disposable.use()');
            }
        }

        throw error;
    }

    public static async useAsync<T extends Disposable, TResult = void>(obj: T, use: (obj: T) => Promise<TResult>): Promise<TResult> {

        try {
            return await use(obj);
        }
        catch (err) {
            throw err;
        }
        finally {
            if (Disposable.isDisposable(obj)) {
                await obj.dispose('after Disposable.useAsync()');
            }
        }
    }

    public static remapDisposed<T>(target: T, reason: string): T {
        const thrower = throwAlreadyDisposed.bind(target, target, reason);
        for (const prop in target) {
            if (typeof target[prop] === 'function') {
                target[prop] = thrower;
            } else {
                Object.defineProperty(target, prop, {
                    get: thrower,
                    set: undefined,
                    configurable: false,
                });
            }
        }
        Object.defineProperty(target, 'disposed', {
            get: () => true,
            set: undefined,
            configurable: false,
        });
        return Object.freeze(target);
    }
}
