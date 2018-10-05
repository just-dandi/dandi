import { Constructor } from '@dandi/common';
import { InjectionToken } from '@dandi/core';
import { MemberMetadata } from '@dandi/model';

import { DataTransformer } from './data.transformer';
import { KeyTransformFn } from './key.transformer';
import { localOpinionatedToken } from './local.token';
import { ModelValidator } from './model.validator';

export interface MemberBuilderOptions {
  validators?: ModelValidator[];
  keyTransform?: {
    transformFn: KeyTransformFn;
    transformJson?: boolean;
  };
}

export interface ModelBuilderOptions extends MemberBuilderOptions {
  dataTransformers?: DataTransformer[];
}

export interface ModelBuilder {
  constructModel<T>(type: Constructor<T>, obj: any, options?: ModelBuilderOptions): T;
  constructMember(metadata: MemberMetadata, key: string, value: any, options?: ModelBuilderOptions): any;
}

export const ModelBuilder: InjectionToken<ModelBuilder> = localOpinionatedToken<ModelBuilder>('ModelBuilder', {
  multi: false,
});
