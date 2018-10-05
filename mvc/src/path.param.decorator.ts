import { ConvertedType } from '@dandi/model-builder';

import { makeRequestParamDecorator } from './request.param.decorator';

import { RequestPathParamMap } from './tokens';

export function PathParam(type?: ConvertedType, name?: string): any {
  return makeRequestParamDecorator(RequestPathParamMap, type || String, name);
}
