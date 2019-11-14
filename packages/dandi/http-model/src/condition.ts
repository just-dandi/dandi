import { Provider } from '@dandi/core'

export interface ConditionWithin {
  (collection: Provider<any[]>): ParameterDecorator;
}

export interface ConditionDecorators {
  within: ConditionWithin;
}
