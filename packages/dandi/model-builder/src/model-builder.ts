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
   * An array of {@see ModelValidator}s the check constructed objects against
   */
  validators?: ModelValidator[]

  /**
   * A {@see KeyTransformFn} that will be used to transform keys of the source object before constructing the model
   */
  keyTransform?: KeyTransformFn
}

/**
 * Options for customizing behavior of {@see ModelBuilder} services.
 */
export interface ModelBuilderOptions extends MemberBuilderOptions {
  /**
   * An array of {@see DataTransformer}s that will be run against source objects before constructing a model
   */
  dataTransformers?: DataTransformer[]
}

/**
 * A utility that allows creating {@see Provider} objects for {@see ModelBuilderOptions}
 */
export const ModelBuilderOptions = {
  /**
   * Creates a {@see Provider<ModelBuilderOptions>} object using the specified `token` and `options` object.
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
   * Converts a POJO to an instance of the specified `type`.
   * @param type A model class
   * @param obj The source object
   * @param options Options for customizing value construction and validation behavior
   */
  constructModel<T>(type: Constructor<T>, obj: any, options?: ModelBuilderOptions): T

  /**
   * Converts a value for a specific property of a model class.
   * @param metadata The metadata generated for the member
   * @param key The name of the property
   * @param value The source value
   * @param options Options for customizing value construction and validation behavior
   */
  constructMember(metadata: MemberMetadata, key: string, value: any, options?: ModelBuilderOptions): any
}

export const ModelBuilder: InjectionToken<ModelBuilder> = localOpinionatedToken<ModelBuilder>('ModelBuilder', {
  multi: false,
})
