import { getControllerMetadata } from './controller.metadata';
import { CorsConfig }            from './cors.config';
import { methodDecorator }       from './http.method.decorator';

export interface CorsDecorator {
    (config: CorsConfig | boolean): ClassDecorator | MethodDecorator;
}

export function Cors(config: CorsConfig | boolean = true): MethodDecorator & ClassDecorator {
    return function(target: any, propertyKey?: string): void {
        if (typeof target === 'function') {
            const meta = getControllerMetadata(target);
            meta.cors = config;
        } else {
            methodDecorator({
                cors: config,
            }, target, propertyKey);
        }
    };
}
