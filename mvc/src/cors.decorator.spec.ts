import { expect } from 'chai';

import { Controller, HttpGet } from '../index';

import { getControllerMetadata } from './controller.metadata';
import { Cors }                  from './cors.decorator';

describe('@Cors', () => {

    describe('as a class decorator', () => {

        it('sets a cors config on the decorated class', () => {

            @Controller('/')
            @Cors()
            class TestController {
                @HttpGet()
                testMethod() {

                }
            }

            const controllerMeta = getControllerMetadata(TestController);
            expect(controllerMeta.cors).to.exist;

        });

    });

    describe('as a method decorator', () => {

        it('sets a cors config on the decorated method', () => {

            @Controller('/')
            class TestController {
                @HttpGet()
                @Cors()
                testMethod() {

                }
            }

            const controllerMeta = getControllerMetadata(TestController);
            const methodMeta = controllerMeta.routeMap.get('testMethod');

            expect(methodMeta).to.exist;
            expect(methodMeta.cors).to.exist;

        });

    });

});
