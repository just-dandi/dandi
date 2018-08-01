import { getControllerMetadata } from './controller.metadata';
import { CorsConfig } from './cors.config';
import { methodDecorator } from './http.method.decorator';

export type CorsDecorator = (config: CorsConfig | true) => ClassDecorator | MethodDecorator;

export function Cors(config: CorsConfig | true = true): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string): void => {
    if (typeof target === 'function') {
      const meta = getControllerMetadata(target);
      meta.cors = config;
    } else {
      methodDecorator(
        {
          cors: config,
        },
        target,
        propertyKey,
      );
    }
  };
}

export function getCorsConfig(controllerCors: CorsConfig | true, methodCors: CorsConfig | true): CorsConfig | true {
  if (!controllerCors) {
    return methodCors;
  }
  if (methodCors === undefined) {
    return controllerCors;
  }
  if (controllerCors === true && methodCors === true) {
    return true;
  }
  return Object.assign({}, controllerCors, methodCors);
}
