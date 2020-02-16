import { LambdaHandler } from '@dandi-contrib/aws-lambda'
import { Inject, Injectable } from '@dandi/core'
import { RequestBody } from '@dandi/http-model'

import { DataProcessorService } from './data-processor.service'
import { ReceiveDataModel, ReceiveDataResponse } from './receive-data.model'

@Injectable()
export class ReceiveDataHandler implements LambdaHandler {

  constructor(@Inject(DataProcessorService) private processor: DataProcessorService) {}

  public handleEvent(@RequestBody(ReceiveDataModel) data: ReceiveDataModel): Promise<ReceiveDataResponse> {
    return this.processor.processData(data)
  }

}
