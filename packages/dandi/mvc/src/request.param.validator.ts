import { MemberMetadata } from '@dandi/model'
import { MemberBuilderOptions, ModelBuilder } from '@dandi/model-builder'

import { MissingPathParamError } from './errors'
import { ParamMap } from './tokens'

export function requestParamValidatorFactory(
  type: any,
  paramName: string,
  memberMetadata: MemberMetadata,
  paramMap: ParamMap,
  builder: ModelBuilder,
  options: MemberBuilderOptions,
): any {
  const value = paramMap[paramName]
  if (typeof value === 'undefined') {
    throw new MissingPathParamError(paramName)
  }
  return builder.constructMember(memberMetadata, paramName, value, options)
}
