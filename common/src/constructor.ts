export interface Constructor<T = any> {
    new (...args: any[]): T;
}

export function isConstructor<T>(obj: any): obj is Constructor<T> {
    if (typeof obj !== 'function') {
        return false;
    }
    return !!obj.prototype;
}
