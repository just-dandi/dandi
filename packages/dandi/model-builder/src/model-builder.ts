import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { DataTransformer } from './data-transformer'
import { KeyTransformFn } from './key-transformer'
import { localToken } from './local-token'
import { ModelValidator } from './model-validator'

export interface MemberBuilderOptions {
  validators?: ModelValidator[]
  keyTransform?: KeyTransformFn
}

export interface ModelBuilderOptions extends MemberBuilderOptions {
  dataTransformers?: DataTransformer[]
}

export const ModelBuilderOptions = {
  provider(token: InjectionToken<ModelBuilderOptions>, options: ModelBuilderOptions): Provider<ModelBuilderOptions> {
    return {
      provide: token,
      useValue: options,
    }
  },
}

export interface ModelBuilder {
  constructModel<T>(type: Constructor<T>, obj: any, options?: ModelBuilderOptions): T
  constructMember(metadata: MemberMetadata, key: string, value: any, options?: ModelBuilderOptions): any
}

export const ModelBuilder: InjectionToken<ModelBuilder> = localToken.opinionated<ModelBuilder>('ModelBuilder', {
  multi: false,
})
