import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { DataTransformer } from './data-transformer'
import { KeyTransformFn } from './key-transformer'
import { localToken } from './local-token'
import { ModelErrors } from './model-errors'
import { ModelValidator } from './model-validator'

export interface MemberBuilderOptions {
  validators?: ModelValidator[]
  keyTransform?: KeyTransformFn
  throwOnError?: boolean
}

export interface MemberBuilderNoThrowOnErrorOptions extends MemberBuilderOptions {
  throwOnError: false
}

export interface ModelBuilderOptions extends MemberBuilderOptions {
  dataTransformers?: DataTransformer[]
}

export interface ModelBuilderNoThrowOnErrorOptions extends ModelBuilderOptions {
  throwOnError: false
}

export const ModelBuilderOptions = {
  provider(token: InjectionToken<ModelBuilderOptions>, options: ModelBuilderOptions): Provider<ModelBuilderOptions> {
    return {
      provide: token,
      useValue: options,
    }
  },
}

export interface MemberBuilderResult {
  builderValue?: any
  source: any
  errors?: ModelErrors
}

export interface ModelBuilderResult<TModel> extends MemberBuilderResult {
  builderValue?: TModel
}

export interface ModelBuilder {
  constructModel<TModel>(type: Constructor<TModel>, obj: any, options?: ModelBuilderOptions): TModel
  constructModel<TModel>(type: Constructor<TModel>, obj: any, options: ModelBuilderNoThrowOnErrorOptions): ModelBuilderResult<TModel>
  constructMember(metadata: MemberMetadata, key: string, value: any, options?: ModelBuilderOptions): any
  constructMember(metadata: MemberMetadata, key: string, value: any, options: MemberBuilderNoThrowOnErrorOptions): MemberBuilderResult
}

export const ModelBuilder: InjectionToken<ModelBuilder> = localToken.opinionated<ModelBuilder>('ModelBuilder', {
  multi: false,
})
