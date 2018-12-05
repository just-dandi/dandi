import { Constructor, isConstructor } from '@dandi/common';
import { InjectionToken, isInjectionToken } from '@dandi/core';

import { PKG } from './local.token';
import { Provider } from './provider';
import { isProvider } from './provider.util';

export type RegisterableTypes = Constructor<any> | Provider<any> | Array<Constructor<any>> | Array<Provider<any>>;
export type Registerable = RegisterableTypes | RegisterableTypes[];

export interface ModuleInfo {
  name: string;
  package: string;
  module: Module;
  registeredBy: Module[];
}

const MODULE_INFO_REG = new Map<InjectionToken<any>, ModuleInfo>();

export class Module extends Array<Registerable> {
  public static readonly MODULE_INFO = Symbol.for(`${PKG}#${Module.name}.MODULE_INFO`);
  public static readonly MODULE_NAME = Symbol.for(`${PKG}#${Module.name}.MODULE_NAME`);
  public static readonly PACKAGE = Symbol.for(`${PKG}#${Module.name}.PACKAGE`);

  public static moduleInfo(target: any): ModuleInfo {
    if (!target) {
      return null;
    }
    if (isInjectionToken(target) && !isConstructor(target)) {
      return MODULE_INFO_REG.get(target);
    }
    return target[Module.MODULE_INFO];
  }

  protected constructor(pkg: string, ...entries: Registerable[]) {
    super(...entries);
    this[Module.PACKAGE] = pkg;
    this[Module.MODULE_NAME] = this.constructor.name.replace(/Builder$/, '');
    this.tag(entries);
  }

  protected tag(entries: Registerable[]): void {
    entries.forEach((entry) => {
      if (Array.isArray(entry)) {
        return this.tag(entry);
      }

      this.tagTarget(entry);
      if (isProvider(entry)) {
        this.tagTarget(entry.provide);
      }
    });
  }

  protected tagTarget(target: InjectionToken<any> | Provider<any>): void {
    let info: ModuleInfo;
    const useMap = isInjectionToken(target) && !isConstructor(target) && !isProvider(target);
    if (useMap) {
      info = MODULE_INFO_REG.get(target as InjectionToken<any>);
    } else {
      info = target[Module.MODULE_INFO];
    }
    if (!info) {
      info = {
        name: this[Module.MODULE_NAME],
        package: this[Module.PACKAGE],
        registeredBy: [],
        module: this,
      };
    }
    info.registeredBy.push(this);
    if (useMap) {
      MODULE_INFO_REG.set(target as InjectionToken<any>, info);
    } else {
      target[Module.MODULE_INFO] = info;
    }
  }
}
