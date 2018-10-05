import { DefaultRouteExecutor } from './default.route.executor';
import { DefaultRouteInitializer } from './default.route.initializer';
import { DefaultRouteHandler } from './default.route.handler';

export const MvcModule = [DefaultRouteExecutor, DefaultRouteHandler, DefaultRouteInitializer];
