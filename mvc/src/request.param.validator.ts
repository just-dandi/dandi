import { MemberMetadata } from '@dandi/model';
import { PrimitiveTypeValidator } from '@dandi/model-validation';

import { ParamMap } from './tokens';

export function requestParamValidatorFactory(
  type: any,
  paramName: string,
  memberMetadata: MemberMetadata,
  paramMap: ParamMap,
  validator: PrimitiveTypeValidator,
) {
  // FIXME: why is memberMetadata null?
  const value = paramMap[paramName];
  return validator.validate(value, memberMetadata);
}
