import { Injectable } from '@dandi/core'

import { ReceiveDataModel, ReceiveDataResponse } from './receive-data.model'

const FAKE_LATENCY = 250

@Injectable()
export class DataProcessorService {
  public processData(data: ReceiveDataModel): Promise<ReceiveDataResponse> {
    return new Promise<ReceiveDataResponse>((resolve) => {
      setTimeout(() => resolve(this.convertData(data)), FAKE_LATENCY)
    })
  }

  private convertData(data: ReceiveDataModel): ReceiveDataResponse {
    return {
      model: data,
      modelType: data.constructor.name,
    }
  }
}
