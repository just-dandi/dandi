import { Injectable, Provider } from '@dandi/core'
import {
  HttpMethod,
  HttpRequest,
  HttpRequestHeadersAccessor,
  HttpRequestHeadersHashAccessor,
  HttpRequestPathParamMap,
  HttpRequestQueryParamMap,
  ParamMap,
} from '@dandi/http'
import { APIGatewayProxyEvent } from 'aws-lambda'

import { AwsHttpRequest } from './aws-http-request'
import { StageVariables } from './http-event-providers'
import { LambdaEventTransformer } from './lambda-event-transformer'

@Injectable(LambdaEventTransformer)
export class HttpEventTransformer implements LambdaEventTransformer<APIGatewayProxyEvent> {

  public transform(event: APIGatewayProxyEvent): Provider<any>[] {
    const providers: Provider<any>[] = []

    providers.push(
      {
        provide: HttpRequest,
        useValue: this.getHttpRequest(event),
      },
      {
        provide: HttpRequestHeadersAccessor,
        useValue: HttpRequestHeadersHashAccessor.fromRaw(event.headers),
      },
      {
        provide: HttpRequestPathParamMap,
        useValue: Object.assign({}, event.pathParameters),
      },
      {
        provide: HttpRequestQueryParamMap,
        useValue: this.getQueryStringParams(event),
      },
      {
        provide: StageVariables,
        useValue: Object.assign({}, event.stageVariables),
      },
    )
    // TODO: add providers as needed:
    //  event.path, event.rawBody, event.headers, event.httpMethod, event.resource, event.requestContext
    //  these are available indirectly by injecting the event itself with a parameter using @Inject(AwsEvent)

    return providers
  }

  private getHttpRequest(event: APIGatewayProxyEvent): HttpRequest {
    let body: any
    if (event.body) {
      if (event.isBase64Encoded) {
        body = Buffer.from(event.body, 'base64').toString('utf-8')
      } else {
        body = event.body
      }
    }

    return new AwsHttpRequest({
      body,
      path: event.path,
      query: this.getQueryStringParams(event),
      params: event.pathParameters,
      method: event.httpMethod.toUpperCase() as HttpMethod,
    })
  }

  private getQueryStringParams(event: APIGatewayProxyEvent): ParamMap {
    if (!event.queryStringParameters) {
      return {}
    }
    return Object.keys(event.queryStringParameters)
      .reduce((result, key) => {
        if (event.multiValueQueryStringParameters[key].length > 1) {
          result[key] = [...event.multiValueQueryStringParameters[key]]
        } else {
          result[key] = event.queryStringParameters[key]
        }
        return result
      }, {})
  }
}
