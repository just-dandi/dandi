import { VIEW_RENDERER } from './render-view';
import { ViewControllerResultTransformer } from './view.controller-result-transformer';
import { ViewRouteTransformer } from './view.route-transformer';

export const MvcViewModule = [
  VIEW_RENDERER,
  ViewControllerResultTransformer,
  ViewRouteTransformer,
];
