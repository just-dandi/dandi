import { ControllerResult } from './controller.result';

export class JsonControllerResult implements ControllerResult {

    public get value(): string {
        return JSON.stringify(this._value);
    }

    public get contentType(): string {
        return 'application/json';
    }

    constructor(private _value: any, public readonly headers?: { [headerName: string]: string }) {
    }
}
