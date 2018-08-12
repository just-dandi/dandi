import { ValidatedType } from '@dandi/model-validation';

import { makeRequestParamDecorator } from './request.param.decorator';

import { RequestPathParamMap } from './tokens';

export function PathParam(type?: ValidatedType, name?: string): any {
  return makeRequestParamDecorator(RequestPathParamMap, type || String, name);
}
