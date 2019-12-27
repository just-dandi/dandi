import { Injector } from './injector'
import { ResolverContext } from './resolver-context'

export interface InstanceGenerator {
  generateInstance<T>(injector: Injector, resolverContext: ResolverContext<T>): Promise<T | T[]>
}

export type InstanceGeneratorFactory = (() => InstanceGenerator) | Promise<InstanceGenerator>
