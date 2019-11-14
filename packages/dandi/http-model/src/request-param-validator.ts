import { ParamMetadata } from '@dandi/core'
import { ParamMap } from '@dandi/http'
import { MemberMetadata } from '@dandi/model'
import { MemberBuilderOptions, ModelBuilder } from '@dandi/model-builder'

import { MissingParamError } from './errors'

export function requestParamValidatorFactory(
  type: any,
  paramName: string,
  paramMeta: ParamMetadata<any>,
  memberMetadata: MemberMetadata,
  paramMap: ParamMap,
  builder: ModelBuilder,
  options: MemberBuilderOptions,
): any {
  const value = paramMap[paramName]
  if (typeof value === 'undefined') {
    if (paramMeta.optional) {
      return undefined
    }
    throw new MissingParamError(paramName)
  }
  return builder.constructMember(memberMetadata, paramName, value, options)
}
