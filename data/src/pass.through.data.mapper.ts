import { Injectable } from '@dandi/core';

import { DataMapper } from './data.mapper';

@Injectable(DataMapper)
export class PassThroughDataMapper implements DataMapper {
  public mapFromDb<T>(obj: any): T {
    return obj;
  }

  public mapToDb<T>(obj: T): any {
    return obj;
  }
}
