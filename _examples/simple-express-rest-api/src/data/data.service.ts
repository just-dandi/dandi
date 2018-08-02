import { Uuid } from '@dandi/common';
import { Injectable, Singleton } from '@dandi/core';

import { DataModel, DataModelRequest } from './data.model';

@Injectable(Singleton) // use the same service across all requests
export class DataService {
  private readonly map: Map<Uuid, any> = new Map<Uuid, DataModel>();

  public async list(): Promise<DataModel[]> {
    return [...this.map.values()];
  }

  public async get(id: Uuid): Promise<DataModel> {
    return this.map.get(id);
  }

  public async add(request: DataModelRequest): Promise<DataModel> {
    const id = Uuid.create();
    const model = new DataModel(Object.assign({ id }, request));
    this.map.set(id, model);
    return model;
  }

  public async update(model: DataModel): Promise<DataModel> {
    const existing = await this.get(model.id);
    if (!existing) {
      this.map.set(model.id, model);
      return model;
    }
    Object.assign(existing, model);
    return existing;
  }

  public async delete(id: Uuid): Promise<boolean> {
    return this.map.delete(id);
  }
}
