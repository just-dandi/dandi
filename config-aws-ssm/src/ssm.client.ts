import { Inject, Injectable } from '@dandi/core';

import { AwsSsmClient } from './ssm.client.factory';

@Injectable()
export class SsmClient {
  constructor(@Inject(AwsSsmClient) private ssm: AwsSsmClient) {}

  public async getParameter(name: string, encrypted: boolean = false): Promise<string> {
    const result = await this.ssm
      .getParameter({
        Name: name,
        WithDecryption: encrypted,
      })
      .promise();
    return result.Parameter.Value;
  }
}
