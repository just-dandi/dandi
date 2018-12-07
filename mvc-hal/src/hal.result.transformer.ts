import { Disposable } from '@dandi/common'
import { Inject, Injectable } from '@dandi/core'
import { Resource, SELF_RELATION } from '@dandi/hal'
import { ControllerResult, ControllerResultTransformer, MvcRequest, ParamMap, RequestQueryParamMap } from '@dandi/mvc'

import { CompositionContext } from './composition.context'
import { HalControllerResult } from './hal.controller.result'
import { ResourceComposer } from './resource.composer'

export const EMBED_RELS_KEY = '_embedded'

@Injectable(ControllerResultTransformer)
export class HalResultTransformer implements ControllerResultTransformer {
  constructor(
    @Inject(ResourceComposer) private composer: ResourceComposer,
    @Inject(MvcRequest) private request: MvcRequest,
    @Inject(RequestQueryParamMap) private queryParams: ParamMap,
  ) {}

  public async transform(result: ControllerResult): Promise<ControllerResult> {
    if (!Resource.isResource(result.resultObject)) {
      return result
    }

    const embeddedRels = this.queryParams[EMBED_RELS_KEY]
    const context: CompositionContext = CompositionContext.for(
      SELF_RELATION,
      this.request.path,
      embeddedRels ? (Array.isArray(embeddedRels) ? embeddedRels : embeddedRels.split(',')) : [],
    )
    return Disposable.useAsync(context, async () => {
      const resource = await this.composer.compose(
        result.resultObject,
        context,
      )
      return new HalControllerResult(resource, result.headers)
    })
  }
}
