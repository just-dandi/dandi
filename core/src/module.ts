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
  private static readonly MODULE_NAME = Symbol.for(`${PKG}#${Module.name}.moduleName`);
  private static readonly PACKAGE = Symbol.for(`${PKG}#${Module.name}.package`);
  private static readonly MODULE_INFO = Symbol.for(`${PKG}#${Module.name}.moduleInfo`);

  public static moduleInfo(target: any): ModuleInfo {
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

      const token: InjectionToken<any> = isProvider(entry) ? entry.provide : (entry as Constructor<any>);
      this.tagTarget(token);
      this.tagTarget(entry as Provider<any>);
    });
  }

  protected tagTarget(target: InjectionToken<any> | Provider<any>): void {
    let info: ModuleInfo;
    if (isInjectionToken(target) && !isConstructor(target)) {
      info = MODULE_INFO_REG.get(target);
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
    if (isInjectionToken(target) && !isConstructor(target)) {
      MODULE_INFO_REG.set(target, info);
    } else {
      target[Module.MODULE_INFO] = info;
    }
  }
}
