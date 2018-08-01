import { InjectionToken } from '@dandi/core';

import { localOpinionatedToken } from './local.token';

export interface DataMapper {
  mapFromDb<T>(obj: any): T;
  mapToDb<T>(obj: T): any;
}

export const DataMapper: InjectionToken<DataMapper> = localOpinionatedToken<DataMapper>('DataMapper', { multi: false });
