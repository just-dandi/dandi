import { Constructor, isPrimitiveType } from '@dandi/common'
import { Inject, Injectable } from '@dandi/core'
import { MemberMetadata, OneOf, getAllKeys, getModelMetadata } from '@dandi/model'

import {
  MemberBuilderNoThrowOnErrorOptions,
  MemberBuilderOptions,
  MemberBuilderResult,
  ModelBuilder,
  ModelBuilderNoThrowOnErrorOptions,
  ModelBuilderOptions,
  ModelBuilderResult,
} from './model-builder'
import { ModelBuilderError } from './model-builder-error'
import { ModelError } from './model-error'
import { ModelErrorKey } from './model-error-key'
import { ModelErrors } from './model-errors'
import { ModelValueConversionError } from './model-value-conversion-error'
import { OneOfConversionAttempt, OneOfConversionError } from './one-of-conversion-error'
import { PrimitiveTypeConverter } from './primitive-type-converter'
import { TypeConversionError } from './type-converter'

@Injectable(ModelBuilder)
export class MetadataModelBuilder implements ModelBuilder {
  constructor(@Inject(PrimitiveTypeConverter) private primitive: PrimitiveTypeConverter) {}

  public constructModel<TModel>(type: Constructor<TModel>, source: any, options?: ModelBuilderOptions): TModel
  public constructModel<TModel>(type: Constructor<TModel>, source: any, options: ModelBuilderNoThrowOnErrorOptions): ModelBuilderResult<TModel>
  public constructModel<TModel>(type: Constructor<TModel>, source: any, options?: ModelBuilderOptions): TModel | ModelBuilderResult<TModel> {
    options = Object.assign({
      throwOnError: true,
    }, options)
    if (options.dataTransformers) {
      options.dataTransformers.forEach((dt) => (source = dt.transform(source)))
    }
    const [errors, modelValue] = this.constructModelInternal(type, source, null, options || {})
    const modelErrors = ModelErrors.create(type, errors)
    if (options.throwOnError) {
      if (errors.length) {
        throw new ModelBuilderError(type, errors, modelErrors)
      }
      return modelValue
    }
    return {
      builderValue: modelValue,
      source,
      errors: modelErrors,
    }
  }

  private constructModelInternal<TModel>(
    type: Constructor<TModel>,
    source: any,
    parentKey: string,
    options: MemberBuilderOptions,
  ): [ModelError[], TModel] {
    if (!type) {
      return [[], source]
    }

    const modelMetadata = getModelMetadata(type)
    const typeKeys = getAllKeys(modelMetadata)

    const result = new type()

    if (options.keyTransform && !Array.isArray(source) && typeof source === 'object') {
      source = Object.keys(source).reduce((transformResult, key) => {
        transformResult[options.keyTransform(key)] = source[key]
        return transformResult
      }, {})
    }

    const modelErrors: ModelError[] = []
    typeKeys.forEach((key) => {
      const memberMetadata = modelMetadata[key]
      const objValue = this.getSourceValue(source, key, memberMetadata)
      try {
        const [memberErrors, memberValue] = this.constructMemberInternal(memberMetadata, this.getKey(parentKey, key), objValue, options)
        result[key] = memberValue
        modelErrors.push(...memberErrors)
      } catch (err) {
        if (err instanceof ModelError) {
          modelErrors.push(err)
        } else {
          modelErrors.push(new ModelError(key, ModelErrorKey.unknown, undefined, err))
        }
      }
    })

    return [modelErrors, result]
  }

  private getSourceValue(source: any, key: string, memberMetadata: MemberMetadata): any {
    if (!memberMetadata.sourceAccessor) {
      return source[key]
    }

    if (typeof memberMetadata.sourceAccessor === 'function') {
      return memberMetadata.sourceAccessor(source)
    }

    return memberMetadata.sourceAccessor.split('.').reduce((source, segment) => {
      if (!source) {
        return source
      }
      return source[segment]
    }, source)
  }

  public constructMember(metadata: MemberMetadata, key: string, source: any, options?: MemberBuilderOptions): any
  public constructMember(metadata: MemberMetadata, key: string, source: any, options: MemberBuilderNoThrowOnErrorOptions): MemberBuilderResult
  public constructMember(metadata: MemberMetadata, key: string, source: any, options?: MemberBuilderOptions): any | MemberBuilderResult {
    options = Object.assign({
      throwOnError: true,
    }, options)
    const [errors, memberValue] = this.constructMemberInternal(metadata, key, source, options)
    const modelErrors = ModelErrors.create(metadata.type, errors)
    if (options.throwOnError) {
      if (errors.length) {
        throw new ModelBuilderError(metadata.type, errors, modelErrors)
      }
      return memberValue
    }
    return {
      builderValue: memberValue,
      source,
      errors: modelErrors,
    }
  }

  private constructMemberInternal(
    metadata: MemberMetadata,
    key: string,
    source: any,
    options: MemberBuilderOptions,
  ): [ModelError[], any] {
    let result = source
    let modelErrors: ModelError[] = []

    if (source !== null && source !== undefined && source !== '') {
      try {
        [modelErrors, result] = this.constructMemberByType(metadata, key, source, options)
      } catch (err) {
        modelErrors.push(err)
        result = undefined
      }
    }

    if (options.validators && !modelErrors.length) {
      options.validators.forEach((validator) => {
        modelErrors.push(...validator.validateMember(metadata, key, result))
      })
    }

    return [modelErrors, result]
  }

  private constructMemberByType(metadata: MemberMetadata, key: string, value: any, options: MemberBuilderOptions): [ModelError[], any] {
    if ((metadata.type as any) === Array) {
      return this.constructArrayMember(metadata, key, value, options)
    }

    if (metadata.type === Set) {
      return this.constructSetMember(metadata, key, value, options)
    }

    if (metadata.type === Map) {
      return this.constructMapMember(metadata, key, value, options)
    }

    if ((metadata.type as any) === OneOf) {
      return this.constructOneOf(metadata, key, value, options)
    }

    if (isPrimitiveType(metadata.type)) {
      return this.convertPrimitive(metadata, key, value)
    }
    return this.constructModelInternal(
      metadata.type,
      value,
      key,
      metadata.json ? { validators: options.validators } : options,
    )
  }

  private convertPrimitive(metadata: MemberMetadata, key: string, value: any): [ModelError[], any] {
    try {
      return [[], this.primitive.convert(value, metadata)]
    } catch (err) {
      return [[new ModelError(key, ModelErrorKey.type, undefined, err)], undefined]
    }
  }

  private getKey(parentKey: string, key: string, debugModifier?: string): string {
    const isNumericKey = !isNaN(parseInt(key, 10))
    const keyStr = isNumericKey ? `[${key}]` : key
    return `${parentKey || ''}${parentKey && !isNumericKey ? '.' : ''}${keyStr}${debugModifier ? `.${debugModifier}` : ''}`
  }

  private constructOneOf(metadata: MemberMetadata, key: string, value: any[], options: MemberBuilderOptions): [ModelError[], any] {
    const attempts: OneOfConversionAttempt[] = []
    for (const type of metadata.oneOf) {
      const oneOfMeta: MemberMetadata = { type }
      const [attemptErrors, attemptResult] = this.constructMemberInternal(oneOfMeta, key, value, options)
      if (!attemptErrors.length) {
        return [attemptErrors, attemptResult]
      }
      attempts.push({ type, errors: attemptErrors })
    }
    return [[new OneOfConversionError(key, ModelErrorKey.oneOf, attempts)], undefined]
  }

  private constructArrayMember(
    metadata: MemberMetadata,
    key: string,
    value: any[],
    options: MemberBuilderOptions,
  ): [ModelError[], any[]] {
    if (!Array.isArray(value)) {
      return [[new ModelValueConversionError(key, ModelErrorKey.array, new TypeConversionError(value, Array))], undefined]
    }

    return value.reduce(([errors, result], entry, index) => {
      const entryMeta: MemberMetadata = { type: metadata.valueType }
      const [entryErrors, entryValue] = this.constructMemberInternal(entryMeta, this.getKey(key, index.toString()), entry, options)
      errors.push(...entryErrors)
      result.push(entryValue)
      return [errors, result]
    }, [[], []])
  }

  private constructSetMember(
    metadata: MemberMetadata,
    key: string,
    value: any[],
    options: MemberBuilderOptions,
  ): [ModelError[], Set<any>] {
    if (!Array.isArray(value)) {
      return [[new ModelValueConversionError(key, ModelErrorKey.set, new TypeConversionError(value, Set))], undefined]
    }

    return value.reduce(([errors, result], entry, index) => {
      const entryMeta: MemberMetadata = { type: metadata.valueType }
      const [entryErrors, entryValue] = this.constructMemberInternal(entryMeta, this.getKey(key, index.toString()), entry, options)
      errors.push(...entryErrors)
      result.add(entryValue)
      return [errors, result]
    }, [[], new Set()])
  }

  private constructMapMember(
    metadata: MemberMetadata,
    key: string,
    value: any,
    options: MemberBuilderOptions,
  ): [ModelError[], Map<any, any>] {
    if (typeof value !== 'object') {
      return [[new ModelValueConversionError(key, ModelErrorKey.map, new TypeConversionError(value, Map))], undefined]
    }

    return Object.keys(value).reduce(([errors, result], mapKey) => {
      const keyMeta: MemberMetadata = { type: metadata.keyType }
      // note: the real options are not passed for the key because map keys must not be transformed
      const keyOptions = Object.assign({}, options)
      delete keyOptions.keyTransform
      const [keyErrors, convertedKey] = this.constructMemberInternal(keyMeta, this.getKey(key, mapKey, 'key'), mapKey, keyOptions)
      errors.push(...keyErrors)

      const valueMeta: MemberMetadata = { type: metadata.valueType }
      const [entryErrors, convertedValue] = this.constructMemberInternal(valueMeta, this.getKey(key, mapKey, 'value'), value[mapKey], options)
      errors.push(...entryErrors)

      if (!keyErrors.length) {
        result.set(convertedKey, convertedValue)
      }

      return [errors, result]
    }, [[], new Map()])
  }
}
