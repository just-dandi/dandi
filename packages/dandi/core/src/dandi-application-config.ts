import { Injector, InjectorFactory } from './injector'
import { InstanceGenerator } from './instance-generator'
import { ObjectFactory } from './factory-util'

export interface DandiApplicationConfig {
  injector?: Injector | Promise<Injector> | InjectorFactory
  generator?: InstanceGenerator | Promise<InstanceGenerator> | ObjectFactory<InstanceGenerator>
  providers?: any[]
  startTs?: number
}
