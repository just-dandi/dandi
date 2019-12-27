import { ProviderOptions } from './provider'

export class InjectableOption {
  constructor(private _setOptions: (options: ProviderOptions<any>) => void) {}
  public setOptions(options: ProviderOptions<any>): void {
    this._setOptions(options)
  }
}
