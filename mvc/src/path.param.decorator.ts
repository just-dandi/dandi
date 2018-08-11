import { ValidatedType } from '@dandi/model-validation';

import { makeRequestParamDecorator, RequestParamDecorator } from './request.param.decorator';

import { RequestPathParamMap } from './tokens';

export function PathParam(type?: ValidatedType, name?: string): RequestParamDecorator<any> {
  return makeRequestParamDecorator(RequestPathParamMap, type || String, name);
}
