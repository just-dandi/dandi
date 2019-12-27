import { RootInjectorFactory, RootInjector } from './injector'
import { InstanceGenerator } from './instance-generator'
import { ObjectFactory } from './factory-util'

export interface DandiApplicationConfig {
  injector?: RootInjector | Promise<RootInjector> | RootInjectorFactory
  generator?: InstanceGenerator | Promise<InstanceGenerator> | ObjectFactory<InstanceGenerator>
  providers?: any[]
  startTs?: number
}
