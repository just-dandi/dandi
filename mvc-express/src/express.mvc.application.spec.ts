import { Repository }                        from '@dandi/core';
import { RouteGenerator, RouteInitializer }  from '@dandi/mvc';
import { stub } from 'sinon';

import { ExpressInstance, ExpressMvcConfig } from '../';

// tslint:disable no-unused-expression no-empty max-classes-per-file

const TEST_EXPRESS_RESOLVER: any = {
    provide:  ExpressInstance,
    useValue: {
        use() {},
        listen() {},
    },
};

Repository.global.register(TEST_EXPRESS_RESOLVER);
Repository.global.register({
    provide:  ExpressMvcConfig,
    useValue: {},
});
Repository.global.register({
    provide:  RouteGenerator,
    useValue: {
        generateRoutes: stub().returns([]),
    },
});
Repository.global.register({
    provide:  RouteInitializer,
    useValue: {},
});
