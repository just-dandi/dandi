import { Bootstrapper, Inject, Injectable, Logger } from '@dandi/core'

import { Action, ActionHost, Actions, CommandAction, CommandInfo } from './command-action'

function isActionName<T>(ctr: Function, obj: any): obj is Actions<T> {
  return typeof obj === 'string' && typeof ctr.prototype[obj] === 'function'
}

@Injectable(Bootstrapper)
export class CommandRunner<THost extends any> implements Bootstrapper {

  constructor(
    @Inject(CommandAction) private actionName: CommandAction<THost>,
    @Inject(ActionHost) private host: THost,
    @Inject(CommandInfo) private info: CommandInfo,
    @Inject(Logger) private logger: Logger,
  ) {}

  public start(): void {
    this.doRun()
  }

  private async doRun(): Promise<void> {
    try {
      await this.run()
      this.logger.info(`${this.actionName} complete.`)
    } catch (err) {
      this.logger.error(err.message, err.stack)
      process.exit(-1)
    }
  }

  private async run(): Promise<void> {
    if (isActionName<THost>(this.host.constructor, this.actionName)) {
      return await (<Action>this.host[this.actionName])(this.info.args)
    }
    throw new Error('Invalid argument for actionName')
  }

}
