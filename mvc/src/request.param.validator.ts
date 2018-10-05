import { MemberMetadata } from '@dandi/model';
import { MemberBuilderOptions, ModelBuilder } from '@dandi/model-builder';

import { ParamMap } from './tokens';

export function requestParamValidatorFactory(
  type: any,
  paramName: string,
  memberMetadata: MemberMetadata,
  paramMap: ParamMap,
  builder: ModelBuilder,
  options: MemberBuilderOptions,
) {
  const value = paramMap[paramName];
  return builder.constructMember(memberMetadata, paramName, value, options);
}
