import { Constructor, isPrimitiveType } from '@dandi/common';
import { Inject, Injectable } from '@dandi/core';
import { getAllKeys, getModelMetadata, MemberMetadata, OneOf } from '@dandi/model';

import { ModelValidationError } from './model.validation.error';
import { MemberBuilderOptions, ModelBuilder, ModelBuilderOptions } from './model.builder';
import { OneOfConversionAttempt, OneOfConversionError } from './one.of.conversion.error';
import { PrimitiveTypeConverter } from './primitive.type.converter';
import { TypeConversionError } from './type.converter';

@Injectable(ModelBuilder)
export class DecoratorModelBuilder implements ModelBuilder {
  constructor(@Inject(PrimitiveTypeConverter) private primitive: PrimitiveTypeConverter) {}

  public constructModel(type: Constructor<any>, obj: any, options?: ModelBuilderOptions): any {
    if (options && options.dataTransformers) {
      options.dataTransformers.forEach((dt) => (obj = dt.transform(obj)));
    }
    return this.constructModelInternal(type, obj, null, options || {});
  }

  private transformKey(key: string, options: ModelBuilderOptions): string {
    return options.keyTransform ? options.keyTransform.transformFn(key) : key;
  }

  private getMemberOptions(memberMetadata: MemberMetadata, options: MemberBuilderOptions) {
    // clone the options
    const memberOptions: ModelBuilderOptions = {};
    if (options.keyTransform) {
      memberOptions.keyTransform = Object.assign({}, options.keyTransform);
    }
    memberOptions.validators = (options.validators || []).slice(0);

    if (memberMetadata.json && memberOptions.keyTransform && !memberOptions.keyTransform.transformJson) {
      memberOptions.keyTransform = null;
    }
    return memberOptions;
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

    typeKeys.forEach((key) => {
      key = this.transformKey(key, options);
      const objValue = obj[key];
      const memberMetadata = modelMetadata[key];
      const memberOptions = this.getMemberOptions(memberMetadata, options);
      try {
        result[key] = this.constructMemberInternal(
          memberMetadata,
          this.getKey(parentKey, key),
          objValue,
          memberOptions,
        );
      } catch (err) {
        throw new ModelValidationError(key, err);
      }
    });

    return result;
  }

  public constructMember(metadata: MemberMetadata, key: string, value: any, options?: MemberBuilderOptions): any {
    return this.constructMemberInternal(metadata, this.transformKey(key, options || {}), value, options || {});
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

    if ((metadata.type as any) === OneOf) {
      return this.constructOneOf(metadata, key, value, options);
    }

    if (isPrimitiveType(metadata.type)) {
      return this.convertPrimitive(metadata, value);
    }
    return this.constructModelInternal(metadata.type, value, key, options);
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
      const entryMeta: MemberMetadata = { type: metadata.subType };
      return this.constructMemberInternal(entryMeta, this.getKey(key, index.toString()), entry, options);
    });
  }
}
