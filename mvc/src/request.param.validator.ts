import { MemberMetadata } from '@dandi/model';
import { ModelValidator } from '@dandi/model-validation';

import { ParamMap } from './tokens';

export function requestParamValidatorFactory(
  type: any,
  paramName: string,
  memberMetadata: MemberMetadata,
  paramMap: ParamMap,
  validator: ModelValidator,
) {
  const value = paramMap[paramName];
  return validator.validateMember(memberMetadata, paramName, value);
}
