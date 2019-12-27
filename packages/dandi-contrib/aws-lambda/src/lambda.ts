import { Constructor } from '@dandi/common'
import {
  AmbientInjectableScanner,
  DandiApplication,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  isInjector,
  Provider,
  Registerable,
} from '@dandi/core'
import {
  DefaultHttpRequestInfo,
  HttpPipeline,
  HttpRequestHandler,
  HttpRequestHandlerMethod,
} from '@dandi/http-pipeline'
import { Context } from 'aws-lambda'

import { AwsContext, AwsEvent } from './event-providers'
import { LambdaEventTransformer } from './lambda-event-transformer'
import { LambdaHandler } from './lambda-handler'
import { localOpinionatedToken } from './local.token'

const LambdaHandler: InjectionToken<LambdaHandler> = localOpinionatedToken('LambdaHandler', { multi: false })

export type HandlerFn<TEvent = any, TResult = any> = (event: TEvent, context: Context) => void | Promise<TResult>

@Injectable()
export class Lambda<TEvent, TEventData, THandler extends LambdaHandler> {

  public static handler<TEvent, TEventData, THandler extends LambdaHandler>(
    handlerServiceType: Constructor<THandler>,
    injector: Injector,
  ): HandlerFn<TEvent, any>

  public static handler<TEvent, TEventData, THandler extends LambdaHandler>(
    handlerServiceType: Constructor<THandler>,
    ...modulesOrProviders: Registerable[]
  ): HandlerFn<TEvent, any>

  static handler<TEvent, TEventData, THandler extends LambdaHandler>(
    handlerServiceType: Constructor<THandler>,
    ...modulesOrProviders: any[]
  ): HandlerFn<TEvent, any> {
    let injectorReady: Injector | Promise<Injector> =
      modulesOrProviders.length === 1 && isInjector(modulesOrProviders[0]) && modulesOrProviders[0]

    const providers = [{
      provide: LambdaHandler,
      useClass: handlerServiceType,
    }]

    if (!injectorReady) {
      providers.push(...modulesOrProviders)

      const app = new DandiApplication({
        providers: [AmbientInjectableScanner],
      })
      injectorReady = app.start()
    }


    let lambda: Lambda<TEvent, TEventData, THandler>

    return async (event: TEvent, context: Context) => {
      const injector = await injectorReady

      if (!lambda) {
        // eslint-disable-next-line require-atomic-updates
        lambda = (await injector.inject(Lambda, ...providers)).singleValue
      }

      return await lambda.handleEvent(event, context)
    }
  }

  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(LambdaEventTransformer) private transformer: LambdaEventTransformer<any>,
    @Inject(HttpPipeline) private httpPipeline: HttpPipeline,
    @Inject(LambdaHandler) private handler: LambdaHandler,
  ) {}

  public async handleEvent(event: TEvent, context: Context): Promise<any> {
    const providers = this.createProviders(event, context)
    return await this.injector.invoke(this.httpPipeline, 'handleRequest', ...providers)
  }

  private createProviders(event: TEvent, context: Context): Provider<any>[] {
    return this.transformer.transform(event, context).concat([
      { provide: AwsEvent, useValue: event },
      { provide: AwsContext, useValue: context },
      {
        provide: HttpRequestHandler,
        useValue: this.handler,
      },
      {
        provide: HttpRequestHandlerMethod,
        useValue: 'handleEvent',
      },
      DefaultHttpRequestInfo,
    ])
  }
}
