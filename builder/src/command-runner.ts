import { EntryPoint, Inject, Injectable, Logger } from '@dandi/core'

import { Action, ActionHost, Actions, CommandAction, CommandInfo } from './command-action'

function isActionName<T>(ctr: Function, obj: any): obj is Actions<T> {
  return typeof obj === 'string' && typeof ctr.prototype[obj] === 'function'
}

@Injectable(EntryPoint)
export class CommandRunner<THost extends any> implements EntryPoint {

  constructor(
    @Inject(CommandAction) private actionName: CommandAction<THost>,
    @Inject(ActionHost) private host: THost,
    @Inject(CommandInfo) private info: CommandInfo,
    @Inject(Logger) private logger: Logger,
  ) {}

  public run(): void {
    this.safeRun()
  }

  private async safeRun(): Promise<void> {
    try {
      await this.runAction()
      const actionDisplayName = `${this.actionName.toString().substring(0, 1).toLocaleUpperCase()}${this.actionName.toString().substring(1)}`
      this.logger.info(`${actionDisplayName} complete.`)
    } catch (err) {
      this.logger.error(err.message, err.stack)
      process.exit(-1)
    }
  }

  private async runAction(): Promise<void> {
    if (isActionName<THost>(this.host.constructor, this.actionName)) {
      return await (<Action>this.host[this.actionName])(this.info.args)
    }
    throw new Error('Invalid argument for actionName')
  }

}
