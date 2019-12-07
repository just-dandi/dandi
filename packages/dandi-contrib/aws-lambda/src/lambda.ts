import { Constructor } from '@dandi/common'
import {
  AmbientInjectableScanner,
  DandiApplication,
  Inject,
  Injectable,
  InjectionToken,
  Injector,
  isInjector,
  Optional,
  Provider,
  Registerable,
} from '@dandi/core'
import { Context } from 'aws-lambda'

import { AwsContext, AwsEvent } from './event-providers'
import { LambdaErrorHandler } from './lambda-error.handler'
import { LambdaEventTransformer } from './lambda-event-transformer'
import { LambdaHandler } from './lambda-handler'
import { LambdaResponder } from './lambda-responder'
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

      return lambda.handleEvent(event, context)
    }
  }

  constructor(
    @Inject(Injector) private injector: Injector,
    @Inject(LambdaEventTransformer) private transformer: LambdaEventTransformer<any>,
    @Inject(LambdaHandler) private handler: LambdaHandler,
    @Inject(LambdaResponder) private responder: LambdaResponder<any>,
    @Inject(LambdaErrorHandler)
    @Optional()
    private errorHandlers: Array<LambdaErrorHandler<TEvent>>,
  ) {}

  public async handleEvent(event: TEvent, context: Context): Promise<any> {
    try {
      const providers = this.createProviders(event, context)
      const result = await this.injector.invoke(this.handler, 'handleEvent', ...providers)
      return await this.responder.handleResponse(result)
    } catch (err) {
      if (this.errorHandlers) {
        this.errorHandlers.forEach((handler) => handler.handleError(event, err))
      }
      return await this.responder.handleError(err)
    }
  }

  private createProviders(event: TEvent, context: Context): Provider<any>[] {
    return this.transformer.transform(event, context).concat([
      { provide: AwsEvent, useValue: event },
      { provide: AwsContext, useValue: context },
    ])
  }
}
