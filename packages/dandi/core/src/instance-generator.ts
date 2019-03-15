import { Injector } from './injector'
import { ResolverContext } from './resolver-context'

/**
 * A service that is responsible for instantiating objects and values used in dependency injection.
 */
export interface InstanceGenerator {
  /**
   * Generates the object instance defined by the `resolverContext`'s target. Returns a `Promise` that resolves to
   * a single instance for non-multi providers, or an array for multi providers.
   * @param resolverContext A [[ResolverContext]] instance used to configure the instance and resolve any dependencies
   */
  generateInstance<T>(resolverContext: ResolverContext<T>): Promise<T | T[]>
}

/**
 * A factory function that instantiates an [[InstanceGenerator]] instance.
 */
export type InstanceGeneratorFactory = ((injector: Injector) => InstanceGenerator) | Promise<InstanceGenerator>
