import { ClassProvider, Inject, Injectable, Logger, Repository } from '@dandi/di-core';

import { mergeAuthorization }    from './authorization.metadata';
import { Controller }            from './controller.decorator';
import { getControllerMetadata } from './controller.metadata';
import { CorsConfig }            from './cors.config';
import { Route }                 from './route';
import { RouteGenerator }        from './route.generator';

@Injectable(RouteGenerator)
export class DecoratorRouteGenerator implements RouteGenerator {

    constructor(
        @Inject(Logger) private logger: Logger,
    ) {}

    private getCorsConfig(controllerCors: CorsConfig | boolean, methodCors: CorsConfig | boolean): CorsConfig | boolean {
        if (!controllerCors) {
            return methodCors;
        }
        if (controllerCors === true && methodCors === true) {
            return true;
        }
        return Object.assign({}, controllerCors, methodCors);
    }


    public generateRoutes(): Route[] {

        this.logger.debug('generating routes...');

        const routes: Route[] = [];

        for (const controllerEntry of Repository.for(Controller).entries()) {

            const controllerProvider = controllerEntry as ClassProvider<any>;
            const controllerCtr = controllerProvider.useClass;
            const meta = getControllerMetadata(controllerCtr);
            const controllerCors = meta.cors;

            this.logger.debug('found controller', controllerCtr.name);

            for (const [controllerMethod, controllerMethodMetadata] of meta.routeMap.entries()) {

                const authorizationMeta = mergeAuthorization(meta, controllerMethodMetadata);
                const authorization = authorizationMeta && authorizationMeta.authorization;
                const methodCors = controllerMethodMetadata.cors;
                const cors = this.getCorsConfig(controllerCors, methodCors);

                for (const [methodPath, httpMethods] of controllerMethodMetadata.routePaths.entries()) {

                    const path = `${meta.path}${(methodPath && !methodPath.startsWith('/')) ? '/' : ''}${methodPath}`;

                    httpMethods.forEach(httpMethod => {

                        this.logger.debug(`generated route for ${controllerCtr.name}.${controllerMethod}:`, httpMethod.toUpperCase(), path);

                        routes.push({
                            httpMethod,
                            siblingMethods: httpMethods,
                            path,
                            cors,
                            controllerCtr,
                            controllerMethod,
                            authorization,
                        });

                    });

                }

            }
        }

        return routes;
    }
}
