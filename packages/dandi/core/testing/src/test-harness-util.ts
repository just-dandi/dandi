import { Constructor, isConstructor } from '@dandi/common'
import { Provider } from '@dandi/core'

import { TestHarness } from './test-harness'
import { RootTestInjector } from './test-injector'

export function testHarness(...providers: any[]): RootTestInjector {
  return new TestHarness(providers)
}

/**
 * Creates an instance of {TestResolver} that automatically creates stub instances of classes it does not already
 * have registered providers for
 * @param providers
 */
export function stubHarness(...providers: any[]): RootTestInjector {
  return new TestHarness(providers, true, true)
}

export async function testHarnessSingle(...providers: any[]): Promise<RootTestInjector> {
  const harness = new TestHarness(providers, false)
  await harness.ready
  return harness
}

export async function stubHarnessSingle(...providers: any[]): Promise<RootTestInjector> {
  const harness = new TestHarness(providers, false, true)
  await harness.ready
  return harness
}

export type TestProvider<T> = Provider<T> & { underTest?: boolean }

export function underTest<T>(provider: Constructor<T> | Provider<T>): TestProvider<T> {
  if (isConstructor(provider)) {
    return {
      provide: provider,
      useClass: provider,
      underTest: true,
    }
  }
  return Object.assign({
    underTest: true,
  }, provider)
}
