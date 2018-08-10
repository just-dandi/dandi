import { ValidatedType } from '@dandi/model-validation';
import { makeRequestParamDecorator, RequestParamDecorator } from '@dandi/mvc/src/request.param.decorator';

import { RequestPathParamMap } from './tokens';

export function PathParam(type?: ValidatedType, name?: string): RequestParamDecorator<any> {
  return makeRequestParamDecorator(RequestPathParamMap, type || String, name);
}
