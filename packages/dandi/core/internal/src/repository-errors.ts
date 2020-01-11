import { AppError } from '@dandi/common'
import { RegistrationSource, ModuleInfo } from '@dandi/core/types'

import { DandiModule } from './dandi-module'

function getRegistrationTargetSourceString(source: RegistrationSource): string {
  const str = source.parent ? `${getRegistrationTargetSourceString(source.parent)} -> ` : ''
  const moduleInfo = DandiModule.moduleInfo(source.constructor)
  const sourceName = moduleInfo ?
    `(${moduleInfo.package}#${moduleInfo.name}):${source.constructor.name}` :
    source.constructor.name
  return `${str}${sourceName}${source.tag || ''}`
}

export class RegistrationError extends AppError {
  public readonly moduleInfo: ModuleInfo

  constructor(message: string, public readonly target: any) {
    super(message)
    this.moduleInfo = DandiModule.moduleInfo(target)
  }
}

export class InvalidRegistrationTargetError extends RegistrationError {
  constructor(public readonly source: RegistrationSource, target: any, public readonly options: any) {
    super(`Invalid Registration Target '${target}' specified by ${getRegistrationTargetSourceString(source)}`, target)
  }
}

export class ConflictingRegistrationOptionsError extends AppError {
  constructor(message: string, public readonly existing: any, public target: any) {
    super(message)
  }
}

export class InvalidRepositoryScopeError extends AppError {
  constructor(public readonly context: any) {
    super('A scope must be specified')
  }
}
