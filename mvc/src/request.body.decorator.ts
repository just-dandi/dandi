import { Constructor }    from '@dandi/core';
import { getInjectableParamMetadata, MethodTarget, ParamMetadata, Provider } from '@dandi/di-core';
import { ModelValidator } from '@dandi/model-validation';

import { ModelBindingError } from './errors';
import { MvcRequest }        from './mvc.request';
import { HttpRequestBody }   from './tokens';

export interface RequestBody<TModel, TTarget> extends ParamMetadata<TTarget> {
    model: Constructor<TModel>;
}

export function requestBodyProvider(model: Constructor<any>): Provider<any> {
    return {
        provide: HttpRequestBody,
        useFactory: (req: MvcRequest, validator: ModelValidator) => {
            if (!req.body) {
                return null;
            }
            try {
                return validator.validateModel(model, req.body);
            } catch (err) {
                throw new ModelBindingError(err);
            }
        },
        singleton: true,
        deps: [MvcRequest, ModelValidator]
    }
}

export function requestBodyDecorator<TModel, TTarget>(
    requestBody: RequestBody<TModel, TTarget>,
    target: MethodTarget<TTarget>,
    propertyName: string,
    paramIndex: number
) {
    const meta = getInjectableParamMetadata<TTarget, RequestBody<TModel, TTarget>>(target, propertyName, paramIndex);
    meta.token = HttpRequestBody;
    meta.providers = [requestBodyProvider(requestBody.model)];
}

export function RequestBody<TModel, TTarget>(model?: Constructor<TModel>): ParameterDecorator {
    return requestBodyDecorator.bind(null, { model });
}
