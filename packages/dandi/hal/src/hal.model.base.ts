import { HalLink } from './hal.link'

export class HalModelBase {
  private _links: { [rel: string]: HalLink };
  private _embedded: { [rel: string]: HalModelBase | HalModelBase[] };

  protected constructor(obj?: any) {
    Object.assign(this, obj)
  }

  protected getEmbedded<T extends HalModelBase | HalModelBase[]>(rel: string): T {
    if (!this._embedded) {
      return undefined
    }

    return this._embedded[rel] as T
  }

  public getLink(rel: string): HalLink {
    if (!this._links) {
      return undefined
    }

    return this._links[rel]
  }
}
