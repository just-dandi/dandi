import { LambdaHandler } from '@dandi-contrib/aws-lambda'
import { Injectable } from '@dandi/core'
import { QueryParam } from '@dandi/http-model'

@Injectable()
export class HelloWorldHandler implements LambdaHandler {
  public handleEvent(@QueryParam(Number) foo: string): any {
    return {
      message: 'hello!',
      foo,
    }
  }
}
