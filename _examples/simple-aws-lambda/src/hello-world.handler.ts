import { Injectable } from '@dandi/core'
import { QueryParam } from '@dandi/http-model'
import { LambdaHandler } from '@dandi-contrib/aws-lambda'

@Injectable()
export class HelloWorldHandler implements LambdaHandler {

  public handleEvent(@QueryParam(Number) foo: string): any {
    return {
      message: 'hello!',
      foo,
    }
  }

}
