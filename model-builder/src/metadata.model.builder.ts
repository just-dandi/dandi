import { Constructor, isPrimitiveType } from '@dandi/common';
import { Inject, Injectable } from '@dandi/core';
import { getAllKeys, getModelMetadata, MemberMetadata, OneOf } from '@dandi/model';

import { ModelValidationError } from './model.validation.error';
import { MemberBuilderOptions, ModelBuilder, ModelBuilderOptions } from './model.builder';
import { OneOfConversionAttempt, OneOfConversionError } from './one.of.conversion.error';
import { PrimitiveTypeConverter } from './primitive.type.converter';
import { TypeConversionError } from './type.converter';

@Injectable(ModelBuilder)
export class MetadataModelBuilder implements ModelBuilder {
  constructor(@Inject(PrimitiveTypeConverter) private primitive: PrimitiveTypeConverter) {}

  public constructModel(type: Constructor<any>, obj: any, options?: ModelBuilderOptions): any {
    if (options && options.dataTransformers) {
      options.dataTransformers.forEach((dt) => (obj = dt.transform(obj)));
    }
    return this.constructModelInternal(type, obj, null, options || {});
  }

  private constructModelInternal(
    type: Constructor<any>,
    obj: any,
    parentKey: string,
    options: MemberBuilderOptions,
  ): any {
    if (!type) {
      return obj;
    }

    const modelMetadata = getModelMetadata(type);
    const typeKeys = getAllKeys(modelMetadata);

    const result = new type(obj);

    if (options.keyTransform && !Array.isArray(obj) && typeof obj === 'object') {
      obj = Object.keys(obj).reduce((result, key) => {
        result[options.keyTransform(key)] = obj[key];
        return result;
      }, {});
    }

    typeKeys.forEach((key) => {
      const memberMetadata = modelMetadata[key];
      const objValue = this.getSourceValue(obj, key, memberMetadata);
      try {
        result[key] = this.constructMemberInternal(memberMetadata, this.getKey(parentKey, key), objValue, options);
      } catch (err) {
        throw new ModelValidationError(key, err);
      }
    });

    return result;
  }

  private getSourceValue(source: any, key: string, memberMetadata: MemberMetadata): any {
    if (!memberMetadata.sourceAccessor) {
      return source[key];
    }

    if (typeof memberMetadata.sourceAccessor === 'function') {
      return memberMetadata.sourceAccessor(source);
    }

    return memberMetadata.sourceAccessor.split('.').reduce((source, segment) => {
      if (!source) {
        return source;
      }
      return source[segment];
    }, source);
  }

  public constructMember(metadata: MemberMetadata, key: string, value: any, options?: MemberBuilderOptions): any {
    return this.constructMemberInternal(metadata, key, value, options || {});
  }

  private constructMemberInternal(
    metadata: MemberMetadata,
    key: string,
    value: any,
    options: MemberBuilderOptions,
  ): any {
    if (value === null || value === undefined) {
      return value;
    }

    const result = this.constructMemberByType(metadata, key, value, options);

    if (options.validators) {
      options.validators.forEach((validator) => {
        validator.validateMember(metadata, key, result);
      });
    }

    return result;
  }

  private constructMemberByType(metadata: MemberMetadata, key: string, value: any, options: MemberBuilderOptions): any {
    if ((metadata.type as any) === Array) {
      return this.constructArrayMember(metadata, key, value, options);
    }

    if (metadata.type === Set) {
      return this.constructSetMember(metadata, key, value, options);
    }

    if (metadata.type === Map) {
      return this.constructMapMember(metadata, key, value, options);
    }

    if ((metadata.type as any) === OneOf) {
      return this.constructOneOf(metadata, key, value, options);
    }

    if (isPrimitiveType(metadata.type)) {
      return this.convertPrimitive(metadata, value);
    }
    return this.constructModelInternal(
      metadata.type,
      value,
      key,
      metadata.json ? { validators: options.validators } : options,
    );
  }

  private convertPrimitive(metadata: MemberMetadata, value: any): any {
    return this.primitive.convert(value, metadata);
  }

  private getKey(parentKey: string, key: string): string {
    const isNumericKey = !isNaN(parseInt(key, 10));
    const keyStr = isNumericKey ? `[${key}]` : key;
    return `${parentKey || ''}${parentKey && !isNumericKey ? '.' : ''}${keyStr}`;
  }

  private constructOneOf(metadata: MemberMetadata, key: string, value: any[], options: MemberBuilderOptions): any {
    const attempts: OneOfConversionAttempt[] = [];
    for (const type of metadata.oneOf) {
      try {
        const oneOfMeta: MemberMetadata = { type };
        return this.constructMemberInternal(oneOfMeta, key, value, options);
      } catch (error) {
        attempts.push({ type, error });
      }
    }
    throw new OneOfConversionError(attempts);
  }

  private constructArrayMember(
    metadata: MemberMetadata,
    key: string,
    value: any[],
    options: MemberBuilderOptions,
  ): any[] {
    if (!Array.isArray(value)) {
      throw new ModelValidationError(key, new TypeConversionError(value, Array));
    }

    return value.map((entry, index) => {
      const entryMeta: MemberMetadata = { type: metadata.valueType };
      return this.constructMemberInternal(entryMeta, this.getKey(key, index.toString()), entry, options);
    });
  }

  private constructSetMember(
    metadata: MemberMetadata,
    key: string,
    value: any[],
    options: MemberBuilderOptions,
  ): Set<any> {
    if (!Array.isArray(value)) {
      throw new ModelValidationError(key, new TypeConversionError(value, Set));
    }

    return value.reduce((result, entry, index) => {
      const entryMeta: MemberMetadata = { type: metadata.valueType };
      result.add(this.constructMemberInternal(entryMeta, this.getKey(key, index.toString()), entry, options));
      return result;
    }, new Set());
  }

  private constructMapMember(
    metadata: MemberMetadata,
    key: string,
    value: any,
    options: MemberBuilderOptions,
  ): Map<any, any> {
    if (typeof value !== 'object') {
      throw new ModelValidationError(key, new TypeConversionError(value, Map));
    }

    return Object.keys(value).reduce((result, mapKey) => {
      const keyMeta: MemberMetadata = { type: metadata.keyType };
      // note: the real options are not passed for the key because map keys must not be transformed
      const convertedKey = this.constructMemberInternal(keyMeta, this.getKey(key, `(key for '${mapKey}')`), mapKey, {});

      const valueMeta: MemberMetadata = { type: metadata.valueType };
      const convertedValue = this.constructMemberInternal(valueMeta, this.getKey(key, mapKey), value[mapKey], options);

      result.set(convertedKey, convertedValue);

      return result;
    }, new Map());
  }
}
