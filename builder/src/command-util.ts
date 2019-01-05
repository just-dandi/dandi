import { dirname, resolve } from 'path'

import { Command } from 'commander'

import { Builder } from './builder'
import { BuilderProject } from './builder-project'

export type Action = (args?: string[]) => Promise<void>
export type ParamAction<T> = (arg: T, cmd?: Command, args?: string[]) => Promise<void>

export type Filtered<TType, TCondition> = {
  [key in keyof TType]: TType[key] extends TCondition ? key: never
}
export type AllowedKeys<TType, TCondition> = Filtered<TType, TCondition>[keyof TType]
export type Subset<TType, TCondition> = Pick<TType, AllowedKeys<TType, TCondition>>

export type Actions<T> = Subset<T, Action>

function isParamAction(obj: any): obj is ParamAction<any> {
  return typeof obj === 'function'
}

function isActionName<T>(ctr: Function, obj: any): obj is Actions<T> {
  return typeof obj === 'string' && typeof ctr.prototype[obj] === 'function'
}

export class CommandUtil {

  public static projectAction(actionOrActionName: keyof Actions<BuilderProject> | ParamAction<BuilderProject>): (...args: [string | Command]) => Promise<void> {
    return (...args: [string | Command]): Promise<void> => {
      const cmd = args.pop() as Command
      const cmdArgs = args as string[]
      const projectPath = cmd.config ? resolve(process.cwd(), dirname(cmd.config)) : process.cwd()
      const project = new BuilderProject({ projectPath: projectPath, configFile: cmd.config })
      if (isParamAction(actionOrActionName)) {
        return actionOrActionName(project, cmd, cmdArgs)
      }
      if (isActionName(BuilderProject, actionOrActionName)) {
        return (<Action>project[actionOrActionName])(cmdArgs)
      }
      throw new Error('Invalid argument for actionOrActionName')
    }
  }

  public static builderAction(actionOrActionName: keyof Actions<Builder> | ParamAction<Builder>): (cmdOrProjectPath: string | Command, cmd?: Command) => Promise<void> {
    return CommandUtil.projectAction((project, cmd) => {
      const builder = new Builder(project)
      if (isParamAction(actionOrActionName)) {
        return actionOrActionName(builder, cmd)
      }
      if (isActionName(BuilderProject, actionOrActionName)) {
        return builder[actionOrActionName]()
      }
      throw new Error('Invalid argument for actionOrActionName')
    })
  }

}
