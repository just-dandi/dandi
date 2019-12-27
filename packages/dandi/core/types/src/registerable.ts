import { Constructor } from '@dandi/common'

import { Provider } from './provider'

export type RegisterableTypes = Constructor | Provider<any> | Constructor[] | Provider<any>[] | Module
export type Registerable = RegisterableTypes | RegisterableTypes[]
export abstract class Module extends Array<Registerable> {}

export interface ModuleInfo {
  name: string;
  package: string;
  module: Module;
  registeredBy: Module[]
}
