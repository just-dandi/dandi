export class AppError extends Error {

    public static stack(err: Error): string {
        return err instanceof AppError ? err.getStack() : err.stack;
    }

    constructor(message?: string, public readonly innerError?: Error) {
        super(message);
    }

    public getStack(): string {
        let stack = `${this.constructor.name} ${this.stack}`;
        if (this.innerError) {
            const innerStack = this.innerError instanceof AppError ? this.innerError.getStack() : this.innerError.stack;
            stack += '\n Inner ' + innerStack;
        }
        return stack;
    }

}
