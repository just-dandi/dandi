import { AppError } from '@dandi/common'

import { Module, ModuleInfo } from './module'

export class RegistrationError extends AppError {
  public readonly moduleInfo: ModuleInfo;

  constructor(public readonly target: any) {
    super()
    this.moduleInfo = Module.moduleInfo(target)
  }
}

export class InvalidRegistrationTargetError extends RegistrationError {
  constructor(target: any, public readonly options: any) {
    super(target)
  }
}

export class ConflictingRegistrationOptionsError extends AppError {
  constructor(message: string, public readonly existing: any, public target: any) {
    super(message)
  }
}

export class InvalidRepositoryContextError extends AppError {
  constructor(public readonly context: any) {
    super('A context must be specified')
  }
}
