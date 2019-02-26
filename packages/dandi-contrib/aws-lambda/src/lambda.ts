import { Constructor } from '@dandi/common'
import {
  AmbientInjectableScanner,
  Container,
  Inject,
  Injectable,
  InjectionToken,
  Optional,
  Repository,
} from '@dandi/core'
import { Context } from 'aws-lambda'

import { LambdaErrorHandler } from './lambda.error.handler'
import { LambdaEventTransformer } from './lambda.event.transformer'
import { LambdaHandler } from './lambda.handler'
import { LambdaResponder } from './lambda.responder'
import { localOpinionatedToken } from './local.token'

const LambdaHandler: InjectionToken<LambdaHandler<any>> = localOpinionatedToken('LambdaHandler', { multi: false })

export type HandlerFn<TEvent = any, TResult = any> = (event: TEvent, context: Context) => void | Promise<TResult>

@Injectable()
export class Lambda<TEvent, TEventData, THandler extends LambdaHandler<TEventData>> {
  public static handler<TEvent, TEventData, THandler extends LambdaHandler<TEventData>>(
    handlerServiceType: Constructor<THandler>,
    container: Container,
  ): HandlerFn<TEvent, any>;

  public static handler<TEvent, TEventData, THandler extends LambdaHandler<TEventData>>(
    handlerServiceType: Constructor<THandler>,
    ...modulesOrProviders: any[]
  ): HandlerFn<TEvent, any>;

  public static handler<TEvent, TEventData, THandler extends LambdaHandler<TEventData>>(
    handlerServiceType: Constructor<THandler>,
    ...modulesOrProviders: any[]
  ): HandlerFn<TEvent, any> {
    const existingContainer =
      modulesOrProviders.length === 1 && modulesOrProviders[0] instanceof Container && modulesOrProviders[0]

    const container =
      existingContainer ||
      new Container({
        providers: [AmbientInjectableScanner],
      })

    const repo = Repository.for({})
    repo.registerProviders({
      provide: LambdaHandler,
      useClass: handlerServiceType,
    })
    if (!existingContainer) {
      modulesOrProviders.forEach((p) => repo.register(container, p))
    }

    const ready = existingContainer ? Promise.resolve() : container.start()

    let lambda: Lambda<TEvent, TEventData, THandler>

    return async (event: TEvent, context: Context) => {
      await ready

      if (!lambda) {
        lambda = (await container.resolve(Lambda, false, repo)).singleValue
      }

      return lambda.handleEvent(event, context)
    }
  }

  constructor(
    @Inject(LambdaEventTransformer) private transformer: LambdaEventTransformer<any, any>,
    @Inject(LambdaHandler) private handler: LambdaHandler<TEventData>,
    @Inject(LambdaResponder) private responder: LambdaResponder<any>,
    @Inject(LambdaErrorHandler)
    @Optional()
    private errorHandlers: Array<LambdaErrorHandler<TEvent>>,
  ) {}

  public async handleEvent(event: TEvent, context: Context): Promise<any> {
    const eventData = this.transformer.transform(event, context)
    try {
      const result = await this.handler.handleEvent(eventData, context)
      return this.responder.handleResponse(result)
    } catch (err) {
      if (this.errorHandlers) {
        this.errorHandlers.forEach((handler) => handler.handleError(event, err))
      }
      return this.responder.handleError(err)
    }
  }
}
