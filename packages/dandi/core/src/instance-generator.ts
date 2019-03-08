import { Injector } from './injector'
import { ResolverContext } from './resolver-context'

export interface InstanceGenerator {
  generateInstance<T>(resolverContext: ResolverContext<T>): Promise<T | T[]>
}

export type InstanceGeneratorFactory = ((injector: Injector) => InstanceGenerator) | Promise<InstanceGenerator>
