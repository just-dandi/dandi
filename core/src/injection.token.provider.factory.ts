import { InjectionToken } from './injection.token';
import { Provider } from './provider';

export type InjectionTokenProviderFactory<T> = InjectionToken<T> & {
  provider(...args: any[]): Provider<T>;
};
