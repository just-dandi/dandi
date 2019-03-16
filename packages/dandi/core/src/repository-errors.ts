import { AppError } from '@dandi/common'

import { RepositoryRegistrationSource } from './repository-registration'

import { Module, ModuleInfo } from './module'

function getRegistrationTargetSourceString(source: RepositoryRegistrationSource): string {
  const str = source.parent ? `${getRegistrationTargetSourceString(source.parent)} -> ` : ''
  const moduleInfo = Module.moduleInfo(source.constructor)
  const sourceName = moduleInfo ? `(${moduleInfo.package}#${moduleInfo.name}):${source.constructor.name}` : source.constructor.name
  return `${str}${sourceName}${source.tag || ''}`
}

/**
 * A base error type for errors that are thrown during [[Provider]] registration.
 */
export class RegistrationError extends AppError {
  public readonly moduleInfo: ModuleInfo;

  constructor(message: string, public readonly target: any) {
    super(message)
    this.moduleInfo = Module.moduleInfo(target)
  }
}

/**
 * Thrown when attempting to register an object that is not a valid [[Provider]] or [[Constructor]]
 */
export class InvalidRegistrationTargetError extends RegistrationError {
  constructor(public readonly source: RepositoryRegistrationSource, target: any, public readonly options: any) {
    super(`Invalid Registration Target '${target}' specified by ${getRegistrationTargetSourceString(source)}`, target)
  }
}

/**
 * Thrown when attempting to register a [[Provider]] whose [[InjectionOptions]] conflict with another [[Provider]] that
 * was already registered.
 */
export class ConflictingRegistrationOptionsError extends AppError {
  constructor(message: string, public readonly existing: any, public target: any) {
    super(message)
  }
}

/**
 * Thrown when attempting to create a [[Repository]] instance using a non-existent `context` object.
 */
export class InvalidRepositoryContextError extends AppError {
  constructor(public readonly context: any) {
    super('A context must be specified')
  }
}
