import { Command } from 'commander'

import { Builder } from './builder'

import { BuilderProject } from './builder-project'

export type Action = () => Promise<void>
export type ParamAction<T> = (arg: T, cmd?: Command) => Promise<void>

export type Filtered<Type, Condition> = {
  [key in keyof Type]: Type[key] extends Condition ? key: never
}
export type AllowedKeys<Type, Condition> = Filtered<Type, Condition>[keyof Type]
export type Subset<Type, Condition> = Pick<Type, AllowedKeys<Type, Condition>>

export type Actions<T> = Subset<T, Action>

function isParamAction(obj: any): obj is ParamAction<any> {
  return typeof obj === 'function'
}

function isActionName<T>(ctr: Function, obj: any): obj is Actions<T> {
  return typeof obj === 'string' && typeof ctr.prototype[obj] === 'function'
}

export class CommandUtil {

  public static projectAction(actionOrActionName: keyof Actions<BuilderProject> | ParamAction<BuilderProject>): (cmdOrProjectPath: string | Command, cmd?: Command) => Promise<void> {
    return (cmdOrProjectPath: string | Command, cmd?: Command): Promise<void> => {
      let projectPath: string
      if (typeof cmdOrProjectPath === 'string') {
        projectPath = cmdOrProjectPath
      } else {
        projectPath = process.cwd()
        cmd = cmdOrProjectPath
      }

      const project = new BuilderProject({ projectPath: projectPath, configFile: cmd.config })
      if (isParamAction(actionOrActionName)) {
        return actionOrActionName(project, cmd)
      }
      if (isActionName(BuilderProject, actionOrActionName)) {
        return project[actionOrActionName]()
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
