import { Uuid } from '@dandi/common';
import { Inject } from '@dandi/core';
import { Controller, HttpDelete, HttpGet, HttpPost, HttpPut, PathParam, RequestBody } from '@dandi/mvc';

import { DataModel, DataModelRequest } from './data.model';
import { DataService } from './data.service';

@Controller('/data')
export class DataController {
  constructor(@Inject(DataService) private data: DataService) {}

  @HttpGet() // will bind to GET /data
  public async listData(): Promise<DataModel[]> {
    return this.data.list();
  }

  @HttpPost() // will bind to POST /data
  public async createData(
    @RequestBody(DataModelRequest) body: DataModelRequest, // model validation will validate the posted body against the DataModelRequest model
  ): Promise<DataModel> {
    return this.data.add(body);
  }

  @HttpGet('/:id') // will bind to GET /data/:id
  public async getData(
    @PathParam(Uuid) id, // model validation will ensure that this is a valid UUID
  ): Promise<DataModel> {
    return this.data.get(id);
  }

  @HttpPut('/:id') // will bind to PUT /data/:id
  public async replaceData(
    @RequestBody(DataModelRequest) body: DataModel, // model validation will validate the posted body against the DataModelRequest model
  ): Promise<DataModel> {
    return this.data.update(body);
  }

  @HttpDelete('/:id') // will bind to DELETE /data/:id
  public async deleteData(
    @PathParam(Uuid) id, // model validation will ensure that this is a valid UUID
  ): Promise<DataModel> {
    const model = await this.data.get(id);
    await this.data.delete(id);
    return model;
  }
}
