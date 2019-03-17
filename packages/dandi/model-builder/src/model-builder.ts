import { Constructor } from '@dandi/common'
import { InjectionToken, Provider } from '@dandi/core'
import { MemberMetadata } from '@dandi/model'

import { DataTransformer, KeyTransformFn } from './data-transformer'
import { localOpinionatedToken } from './local-token'
import { ModelValidator } from './model-validator'

/**
 * Options for customizing behavior of [[ModelBuilder.constructMember]]
 */
export interface MemberBuilderOptions {
  /**
   * An array of [[ModelValidator]]s the check constructed objects against
   */
  validators?: ModelValidator[]

  /**
   * A [[KeyTransformFn]] that will be used to transform keys of the source object before constructing the model
   */
  keyTransform?: KeyTransformFn
}

/**
 * Options for customizing behavior of [[ModelBuilder]] services.
 */
export interface ModelBuilderOptions extends MemberBuilderOptions {
  /**
   * An array of [[DataTransformer]]s that will be run against source objects before constructing a model
   */
  dataTransformers?: DataTransformer[]
}

/**
 * A utility that allows creating [[Provider]] objects for [[ModelBuilderOptions]]
 */
export const ModelBuilderOptions = {
  /**
   * Creates a [[Provider<ModelBuilderOptions>]] object using the specified `token` and `options` object.
   * @param token
   * @param options
   */
  provider(token: InjectionToken<ModelBuilderOptions>, options: ModelBuilderOptions): Provider<ModelBuilderOptions> {
    return {
      provide: token,
      useValue: options,
    }
  },
}

/**
 * Defines a service that constructs well-defined models from a POJO source object.
 */
export interface ModelBuilder {

  /**
   *
   * @param type
   * @param obj
   * @param options
   */
  constructModel<T>(type: Constructor<T>, obj: any, options?: ModelBuilderOptions): T
  constructMember(metadata: MemberMetadata, key: string, value: any, options?: ModelBuilderOptions): any
}

export const ModelBuilder: InjectionToken<ModelBuilder> = localOpinionatedToken<ModelBuilder>('ModelBuilder', {
  multi: false,
})
