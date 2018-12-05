import { Inject, Injectable } from '@dandi/core';
import { ControllerResult, ControllerResultTransformer, Route } from '@dandi/mvc';

import { ViewRenderer } from './render-view';
import { ViewRoute } from './view-route';

@Injectable(ControllerResultTransformer)
export class ViewControllerResultTransformer implements ControllerResultTransformer {
  public constructor(@Inject(ViewRenderer) private render: ViewRenderer, @Inject(Route) private route: ViewRoute) {}

  public transform(result: ControllerResult): Promise<ControllerResult> {
    return this.render(this.route.view, result.resultObject);
  }
}
