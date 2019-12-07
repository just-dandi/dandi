import { Property, Required } from '@dandi/model'

export class ReceiveDataModel {
  @Property(String)
  @Required()
  public requestId: string

  @Property(String)
  public message: string
}

export interface ReceiveDataResponse {
  model: ReceiveDataModel
  modelType: string
}
