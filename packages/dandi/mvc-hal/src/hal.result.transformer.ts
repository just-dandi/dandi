import { Disposable } from '@dandi/common'
import { Inject, Injectable } from '@dandi/core'
import { Resource, SELF_RELATION } from '@dandi/hal'
import { HttpRequest, HttpRequestQueryParamMap, ParamMap } from '@dandi/http'
import { HttpPipelineResult, HttpPipelineResultTransformer } from '@dandi/http-pipeline'

import { CompositionContext } from './composition.context'
import { ResourceComposer } from './resource.composer'

export const EMBED_RELS_KEY = '_embedded'

@Injectable(HttpPipelineResultTransformer)
export class HalResultTransformer implements HttpPipelineResultTransformer {
  constructor(
    @Inject(ResourceComposer) private composer: ResourceComposer,
    @Inject(HttpRequest) private request: HttpRequest,
    @Inject(HttpRequestQueryParamMap) private queryParams: ParamMap,
  ) {}

  public async transform(result: HttpPipelineResult): Promise<HttpPipelineResult> {
    if (!Resource.isResource(result.data)) {
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
        result.data,
        context,
      )
      return {
        data: resource,
        headers: result.headers,
      }
    })
  }
}
