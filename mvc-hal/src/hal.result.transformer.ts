import { Inject, Injectable } from '@dandi/core';
import { SELF_RELATION } from '@dandi/hal';
import { ControllerResult, ControllerResultTransformer, ParamMap, RequestQueryParamMap, MvcRequest } from '@dandi/mvc';

import { CompositionContext } from './composition.context';
import { HalControllerResult } from './hal.controller.result';
import { ResourceComposer } from './resource.composer';

export const EMBED_RELS_KEY = '_embedded';

@Injectable(ControllerResultTransformer)
export class HalResultTransformer implements ControllerResultTransformer {
  constructor(
    @Inject(ResourceComposer) private composer: ResourceComposer,
    @Inject(MvcRequest) private request: MvcRequest,
    @Inject(RequestQueryParamMap) private queryParams: ParamMap,
  ) {}

  public async transform(result: ControllerResult): Promise<ControllerResult> {
    const embeddedRels = this.queryParams[EMBED_RELS_KEY];
    const context: CompositionContext = CompositionContext.for(
      SELF_RELATION,
      this.request.path,
      embeddedRels ? embeddedRels.split(',') : [],
    );
    const resource = await this.composer.compose(
      result.resultObject,
      context,
    );
    return new HalControllerResult(resource, result.headers);
  }
}
