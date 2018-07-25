import { MethodTarget } from '@dandi/core';

import { getControllerMetadata, RouteMapEntry } from './controller.metadata';
import { CorsConfig } from './cors.config';
import { HttpMethod } from './http.method';

export interface HttpMethodOptions {
    method?: HttpMethod;
    path?: string;
    cors?: CorsConfig | boolean;
}

export interface HttpMethodDecorator {
    (path?: string): MethodDecorator;
}

export type ControllerMethod = string;
export type RoutePath = string;

export function methodDecorator<T>(options: HttpMethodOptions, target: MethodTarget<T>, propertyKey: string) {
    const meta = getControllerMetadata(target.constructor);
    let controllerMethodMetadata = meta.routeMap.get(propertyKey);
    if (!controllerMethodMetadata) {
        controllerMethodMetadata = {
            routePaths: new RouteMapEntry(),
            cors: options.cors,
        };
        meta.routeMap.set(propertyKey, controllerMethodMetadata);
    }
    if (options.cors) {
        controllerMethodMetadata.cors = options.cors;
    }
    if (!controllerMethodMetadata.routePaths) {
        controllerMethodMetadata.routePaths = new RouteMapEntry();
    }
    if (!options.method) {
        return;
    }
    let entryMethods: Set<HttpMethod> = controllerMethodMetadata.routePaths.get(options.path);
    if (!entryMethods) {
        entryMethods = new Set<HttpMethod>();
        controllerMethodMetadata.routePaths.set(options.path, entryMethods);
    }
    entryMethods.add(options.method);
}

function methodDecoratorFactory(method: HttpMethod, path: string = '') {
    const options = { method, path };
    return methodDecorator.bind(null, options);
}

export const HttpGet: HttpMethodDecorator = methodDecoratorFactory.bind(null, HttpMethod.get);
export const HttpPost: HttpMethodDecorator = methodDecoratorFactory.bind(null, HttpMethod.post);
export const HttpPut: HttpMethodDecorator = methodDecoratorFactory.bind(null, HttpMethod.put);
export const HttpPatch: HttpMethodDecorator = methodDecoratorFactory.bind(null, HttpMethod.patch);
export const HttpDelete: HttpMethodDecorator = methodDecoratorFactory.bind(null, HttpMethod.delete);
export const HttpOptions: HttpMethodDecorator = methodDecoratorFactory.bind(null, HttpMethod.options);
