import { FactoryProvider, InjectionToken, Resolver } from '@dandi/core';

import { localOpinionatedToken } from './local.token';
import { ViewEngine } from './view-engine';
import { ViewMetadata } from './view-metadata';
import { ViewResult } from './view-result';

export type ViewRenderer = (view: ViewMetadata, data?: any) => Promise<ViewResult>;

export const ViewRenderer: InjectionToken<ViewRenderer> = localOpinionatedToken('ViewRenderer', { multi: false });

function viewRendererFactory(resolver: Resolver) {
  return async (view: ViewMetadata, data?: any): Promise<ViewResult> => {

    /**
     * TODO: make this better!
     * - update engines to be multi singleton providers
     * - move "path" from view decorator calculation to here
     * - allow mvc-view to be configured with priorities for view engines
     * - ViewTemplateResolver: don't rely on path extension:
     *  - if the name includes a dot and the extension is mapped to a view engine, see if that file exists
     *   - otherwise, check each of the registered view engines (in order of priority) and see if a file with the engine's extension exists
     * - throw if no file
     * - otherwise, use that file path
     * - cache the file resolution result on the controller method metadata
     */

    const extension = view.path.substring(view.path.lastIndexOf('.') + 1);
    const engine = (await resolver.resolve(ViewEngine(extension))).singleValue;
    return new ViewResult(engine, view, data);
  }
}

export const VIEW_RENDERER: FactoryProvider<ViewRenderer> = {
  provide: ViewRenderer,
  useFactory: viewRendererFactory,
  deps: [Resolver],
};
