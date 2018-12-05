import { FactoryProvider, InjectionToken } from '@dandi/core';

import { localOpinionatedToken } from './local.token';
import { ViewEngineResolver } from './view-engine-resolver';
import { ViewMetadata } from './view-metadata';
import { ViewResult } from './view-result';

export type ViewRenderer = (view: ViewMetadata, data?: any) => Promise<ViewResult>;

export const ViewRenderer: InjectionToken<ViewRenderer> = localOpinionatedToken('ViewRenderer', { multi: false });

function viewRendererFactory(resolver: ViewEngineResolver) {
  return async (view: ViewMetadata, data?: any): Promise<ViewResult> => {
    const resolvedView = await resolver.resolve(view);
    return new ViewResult(resolvedView.engine, view, resolvedView.templatePath, data);
  };
}

export const VIEW_RENDERER: FactoryProvider<ViewRenderer> = {
  provide: ViewRenderer,
  useFactory: viewRendererFactory,
  deps: [ViewEngineResolver],
};
