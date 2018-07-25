import { testHarness } from '@dandi/di-core-testing';

import { APIGatewayProxyEvent, Context } from 'aws-lambda';

import { expect } from 'chai';
import { createStubInstance, SinonStubbedInstance, stub } from 'sinon';

import { MockContext } from '../test/mock.context';

import { HttpEventTransformer, HttpHandlerRequest } from './http.event.transformer';
import { LambdaEventTransformer }                   from './lambda.event.transformer';

// tslint:disable no-unused-expression
describe.only('HttpEventTransformer', () => {

    let transformer: LambdaEventTransformer<APIGatewayProxyEvent, HttpHandlerRequest>;
    let body: any;
    let event: any;
    let context: Context;

    beforeEach(() => {
        body = { foo: 'bar '};
        event = {
            body: JSON.stringify(body),
            headers:               'headers',
            httpMethod:            'httpMethod',
            path:                  'path',
            pathParameters:        'pathParameters',
            queryStringParameters: 'queryStringParameters',
            requestContext:        'requestContext',
            resource:              'resource',
            stageVariables:        'stageVariables',
        };
        context = createStubInstance(MockContext);
    });
    afterEach(() => {
        body = undefined;
        event = undefined;
    });

    describe('basic functionality', () => {

        const harness = testHarness(HttpEventTransformer);

        beforeEach(async () => {
            transformer = await harness.inject(LambdaEventTransformer);
        });
        afterEach(() => {
            transformer = undefined;
        });

        it('can be injected as LambdaEventTransformer', () => {
            expect(transformer).to.exist;
        });

        it('creates a HttpHandlerRequest object using the event values and deserialized body', () => {

            const eventWithoutBody = Object.assign({}, event);
            delete eventWithoutBody.body;

            const result = transformer.transform(event, context);

            expect(result).to.include(eventWithoutBody);
            expect(result.body).to.deep.equal(body);
            expect(result.rawBody).to.equal(event.body);

        });

        it('creates a HttpHandlerRequest object using the event values and no body when none exists', () => {

            delete event.body;
            const result = transformer.transform(event, context);

            expect(result).to.include(event);
            expect(result.body).not.to.exist;
            expect(result.rawBody).not.to.exist;

        });


    });

});
