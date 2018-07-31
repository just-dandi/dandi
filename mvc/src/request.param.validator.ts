import { MemberMetadata } from '@dandi/model';
import { TypeValidator } from '@dandi/model-validation';

import { ParamMap } from './tokens';

export function requestParamValidatorFactory(
  type: any,
  paramName: string,
  memberMetadata: MemberMetadata,
  paramMap: ParamMap,
  typeValidator: TypeValidator<any>,
) {
  const value = paramMap[paramName];
  return typeValidator.validate(value, memberMetadata);
}
