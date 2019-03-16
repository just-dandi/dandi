import { Constructor, isConstructor } from '@dandi/common'

import { PKG } from './local-token'
import { Provider } from './provider'
import { isProvider } from './provider-util'
import { InjectionToken, isInjectionToken } from './injection-token'

export type RegisterableTypes = Constructor<any> | Provider<any> | Array<Constructor<any>> | Array<Provider<any>> | Module
export type Registerable = RegisterableTypes | RegisterableTypes[]

/**
 * Contains registration debugging information about where a [[Provider]] or [[Constructor]] was registered
 */
export interface ModuleInfo {
  name: string
  package: string
  module: Module
  registeredBy: Module[]
}

const MODULE_INFO_REG = new Map<InjectionToken<any>, ModuleInfo>()

/**
 * A container class used to logically group [[Provider]], [[Constructor]], and other [[Module]] instances for easy
 * configuration of libraries. `Module` implementations add metadata to their contained entries to make it easier to
 * debug problems during [[Provider]] registration.
 */
export class Module extends Array<Registerable> {

  /**
   * @internal
   * @ignore
   */
  public static readonly MODULE_INFO = Symbol.for(`${PKG}#${Module.name}.MODULE_INFO`)

  /**
   * @internal
   * @ignore
   */
  public static readonly MODULE_NAME = Symbol.for(`${PKG}#${Module.name}.MODULE_NAME`)

  /**
   * @internal
   * @ignore
   */
  public static readonly PACKAGE = Symbol.for(`${PKG}#${Module.name}.PACKAGE`)

  /**
   * Gets a [[ModuleInfo]] object containing registration debugging information for the specified `target`
   * @param target
   */
  public static moduleInfo(target: any): ModuleInfo {
    if (!target) {
      return undefined
    }
    if (isInjectionToken(target) && !isConstructor(target)) {
      return MODULE_INFO_REG.get(target)
    }
    return target[Module.MODULE_INFO]
  }

  protected constructor(pkg: string, ...entries: Registerable[]) {
    super(...entries)
    this[Module.PACKAGE] = pkg
    this[Module.MODULE_NAME] = this.constructor.name.replace(/Builder$/, '')
    this.tag(entries)
  }

  /**
   * Adds registration debugging metadata to the specified `entries`
   * @param entries
   */
  protected tag(entries: Registerable[]): void {
    entries.forEach((entry) => {
      if (Array.isArray(entry)) {
        return this.tag(entry)
      }

      this.tagTarget(entry)
      if (isProvider(entry)) {
        this.tagTarget(entry.provide)
      }
    })
  }

  /**
   * Adds registration debugging metadata to the specified `target`
   * @param target
   */
  protected tagTarget(target: InjectionToken<any> | Provider<any>): void {
    let info: ModuleInfo
    const useMap = isInjectionToken(target) && !isConstructor(target) && !isProvider(target)
    if (useMap) {
      info = MODULE_INFO_REG.get(target as InjectionToken<any>)
    } else {
      info = target[Module.MODULE_INFO]
    }
    if (!info) {
      info = {
        name: this[Module.MODULE_NAME],
        package: this[Module.PACKAGE],
        registeredBy: [],
        module: this,
      }
    }
    info.registeredBy.push(this)
    if (useMap) {
      MODULE_INFO_REG.set(target as InjectionToken<any>, info)
    } else {
      target[Module.MODULE_INFO] = info
    }
  }
}
