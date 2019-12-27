import { isConstructor } from '@dandi/common'
import { isInjectionToken, isProvider } from '@dandi/core/internal/util'
import { InjectionToken, Provider, Registerable, Module, ModuleInfo } from '@dandi/core/types'

import { localToken } from '../../src/local-token'

const MODULE_INFO_REG = new Map<InjectionToken<any>, ModuleInfo>()

export class DandiModule extends Module {
  public static readonly MODULE_INFO = Symbol.for(`${localToken.PKG}#${DandiModule.name}.MODULE_INFO`)
  public static readonly MODULE_NAME = Symbol.for(`${localToken.PKG}#${DandiModule.name}.MODULE_NAME`)
  public static readonly PACKAGE = Symbol.for(`${localToken.PKG}#${DandiModule.name}.PACKAGE`)

  public static moduleInfo(target: any): ModuleInfo {
    if (!target) {
      return undefined
    }
    if (isInjectionToken(target) && !isConstructor(target)) {
      return MODULE_INFO_REG.get(target)
    }
    return target[DandiModule.MODULE_INFO]
  }

  protected constructor(pkg: string, ...entries: Registerable[]) {
    super(...entries)
    this[DandiModule.PACKAGE] = pkg
    this[DandiModule.MODULE_NAME] = this.constructor.name.replace(/Builder$/, '')
    this.tag(entries)
  }

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

  protected tagTarget(target: InjectionToken<any> | Provider<any>): void {
    let info: ModuleInfo
    const useMap = isInjectionToken(target) && !isConstructor(target) && !isProvider(target)
    if (useMap) {
      info = MODULE_INFO_REG.get(target as InjectionToken<any>)
    } else {
      info = target[DandiModule.MODULE_INFO]
    }
    if (!info) {
      info = {
        name: this[DandiModule.MODULE_NAME],
        package: this[DandiModule.PACKAGE],
        registeredBy: [],
        module: this,
      }
    }
    info.registeredBy.push(this)
    if (useMap) {
      MODULE_INFO_REG.set(target as InjectionToken<any>, info)
    } else {
      target[DandiModule.MODULE_INFO] = info
    }
  }
}
