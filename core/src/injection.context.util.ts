import { InjectionContext } from './injection.context';
import { getTokenString } from './injection.token';
import { Provider } from './provider';
import {
  isClassProvider,
  isFactoryProvider,
  isValueProvider,
} from './provider.util';

export function getInjectionContext<T>(
  provider: Provider<T>,
): InjectionContext {
  if (isClassProvider(provider)) {
    return provider.useClass;
  }
  if (isFactoryProvider(provider)) {
    return provider.useFactory;
  }
  if (isValueProvider(provider)) {
    return new Function(
      `return function useValue_${getTokenString(provider.provide)}(){}`,
    )();
  }
}
