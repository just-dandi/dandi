import {
    getInjectableMetadata, Inject, Injectable, Logger, Optional, Provider, Repository, Resolver,
} from '@dandi/core';

import { AuthorizationCondition, DeniedAuthorization } from './authorization.condition';
import { AuthorizationService }        from './authorization.service';
import { AuthorizedUser, AuthorizedUserFactory } from './authorized.user';
import { ForbiddenError, NotAuthorizedError, RequestError } from './errors';
import { MvcRequest }                  from './mvc.request';
import { MvcResponse }                 from './mvc.response';
import { RequestAuthorizationService } from './request.authorization.service';
import { RequestInfo }                 from './request.info';
import { RequestProviderRegistrar }    from './request.provider.registrar';
import { Route }                       from './route';
import { RouteInitializer }            from './route.initializer';

import {
    HttpRequestBody, HttpRequestId, RequestController, RequestPathParamMap, RequestQueryParamMap,
} from './tokens';

export class RouteInitializationError extends RequestError {
    constructor(innerError: Error, public readonly route: Route) {
        super(innerError instanceof RequestError ? innerError.statusCode : 500, 'Error initializing route', innerError.message, innerError);
    }
}

@Injectable(RouteInitializer)
export class DefaultRouteInitializer implements RouteInitializer {

    constructor(
        @Inject(Resolver) private resolver: Resolver,
        @Inject(RequestProviderRegistrar) @Optional() private registrars: RequestProviderRegistrar[],
        @Inject(Logger) private logger: Logger,
    ) {}

    private registerRequestProviders(repo: Repository, route: Route, req: MvcRequest, requestInfo: RequestInfo, res: MvcResponse): void {
        repo.register({ provide: MvcRequest, useValue: req });
        repo.register({ provide: MvcResponse, useValue: res });
        repo.register({ provide: RequestPathParamMap, useValue: req.params });
        repo.register({ provide: RequestQueryParamMap, useValue: req.query });
        repo.register({
            provide: Route,
            useValue: route,
        });
        repo.register(route.controllerCtr, { provide: RequestController });
        repo.register({ provide: HttpRequestId, useValue: requestInfo.requestId });
        repo.register({ provide: RequestInfo, useValue: requestInfo });

    }

    private registerRequestBody(repo: Repository, route: Route): void {
        const meta = getInjectableMetadata(route.controllerCtr.prototype[route.controllerMethod]);
        const requestBody = meta.params.find(param => param.token && param.token === HttpRequestBody);
        if (requestBody) {
            requestBody.providers.forEach(provider => repo.register(provider));
        }
    }

    private async registerAuthProviders(repo: Repository, route: Route, req: MvcRequest): Promise<void> {

        const authHeader = req.get('Authorization');

        if (!authHeader && route.authorization) {
            throw new NotAuthorizedError();
        }

        if (!route.authorization) {
            repo.register({
                provide:  AuthorizedUser,
                useValue: null,
            });
            return;
        }

        const authSchemeEndIndex = authHeader.indexOf(' ');
        const authScheme = authHeader.substring(0, authSchemeEndIndex > 0 ? authSchemeEndIndex : undefined);
        const authServiceResult = await this.resolver.resolve(AuthorizationService(authScheme), !route.authorization);
        if (authServiceResult) {
            repo.register({
                provide: RequestAuthorizationService,
                useValue: authServiceResult.singleValue,
            });
            repo.register(AuthorizedUserFactory);
        }

        if (Array.isArray(route.authorization) && route.authorization.length) {
            route.authorization.forEach(condition => repo.register(condition));
        }

    }

    private async handleAuthorizationConditions(repo: Repository): Promise<void> {

        const results = await this.resolver.resolve(AuthorizationCondition, true, repo);
        if (!results) {
            return;
        }

        const denied = results.arrayValue.filter(result => !result.allowed) as DeniedAuthorization[];
        if (denied.length) {
            throw new ForbiddenError(denied.map(d => d.reason).join('; '));
        }
    }

    private async registerRequestRegistrarProviders(repo: Repository): Promise<void> {
        if (!this.registrars) {
            return;
        }
        await Promise.all(this.registrars.map(async (registrar: RequestProviderRegistrar) => {
            const providers = await this.resolver.invoke(registrar, registrar.provide, repo) as Provider<any>[];
            if (providers) {
                providers.forEach(provider => {
                    repo.register(provider);
                });
            }
        }));
    }

    public async initRouteRequest(route: Route, req: MvcRequest, requestInfo: RequestInfo, res: MvcResponse): Promise<Repository> {

        this.logger.debug(`begin initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod}:`,
            route.httpMethod.toUpperCase(), route.path);

        const repo = Repository.for(req);

        try {
            this.registerRequestProviders(repo, route, req, requestInfo, res);
            await this.registerAuthProviders(repo, route, req);
            this.registerRequestBody(repo, route);
            await this.registerRequestRegistrarProviders(repo);
            await this.handleAuthorizationConditions(repo);

            return repo;
        } catch (err) {
            throw new RouteInitializationError(err, route);
        } finally {
            this.logger.debug(`end initRouteRequest ${route.controllerCtr.name}.${route.controllerMethod}:`,
                route.httpMethod.toUpperCase(), route.path);
        }
    }

}
