// // tslint:disable no-unused-expression
// import { expect } from 'chai';
// import { stub }   from 'sinon';
//
// import { stubConsole } from '../../test/console.util';
//
// import { CORS_ALLOW_CREDENTIALS, CORS_ALLOW_ORIGIN, httpHandler } from './http.handler';
//
// describe('httpHandler', () => {
//
//     stubConsole();
//
//     let method: any;
//     let response: any;
//     let thisObj: any;
//     let handler: (...args: any[]) => any;
//     let body: any;
//     let rawBody: string;
//     let event: any;
//     let context: any;
//
//     beforeEach(() => {
//         method = {
//             call: () => ({}),
//         };
//         response = { message: 'YAY LLAMAS!' };
//         stub(method, 'call').returns(Promise.resolve(response));
//         thisObj = {};
//         handler = httpHandler.bind(thisObj, method);
//         body = { foo: 'bar' };
//         rawBody = JSON.stringify(body);
//         event = {
//             body:    rawBody,
//             headers: {
//                 test: 'hello',
//             },
//             httpMethod:     'test-http-method',
//             path:           'test-path',
//             pathParameters: {
//                 testPathParam: 'test-path-param',
//             },
//             queryStringParameters: {
//                 testQueryParam: 'test-query-param',
//             },
//             requestContext: {},
//             resource:       'test-resource',
//             stageVariables: {},
//         };
//         context = {};
//     });
//     afterEach(() => {
//         method = undefined;
//         thisObj = undefined;
//         handler = undefined;
//         body = undefined;
//         rawBody = undefined;
//         event = undefined;
//         context = undefined;
//     });
//
//     it('invokes the bound method with the specified `this` object', async () => {
//
//         await handler(event, context);
//
//         expect(method.call).to.have.been.calledOnce;
//         const actualThisObj = method.call.firstCall.args[0];
//         expect(actualThisObj).to.equal(thisObj);
//
//     });
//
//     it('parses JSON content from the body property', async () => {
//
//         await handler(event, context);
//
//         expect(method.call).to.have.been.calledOnce;
//         const request = method.call.firstCall.args[1];
//         expect(request.body).to.deep.equal(body);
//
//     });
//
//     it('decodes the body of events marked with isBase64Encoded', async () => {
//
//         event.body = new Buffer(event.body, 'utf-8').toString('base64');
//         expect(() => JSON.parse(event.body), 'sanity check - was still able to parse the encoded JSON').to.throw;
//         event.isBase64Encoded = true;
//
//         await handler(event, context);
//
//         expect(method.call).to.have.been.calledOnce;
//         const request = method.call.firstCall.args[1];
//         expect(request.body).to.deep.equal(body);
//
//     });
//
//     it('includes the raw (JSON string) body on the rawBody property of the request', async () => {
//
//         await handler(event, context);
//         const request = method.call.firstCall.args[1];
//
//         expect(request.rawBody).to.equal(rawBody);
//
//     });
//
//     it('passes a null or undefined body through', async () => {
//
//         body = undefined;
//         rawBody = undefined;
//         event.body = undefined;
//
//         await expect(handler(event, context)).to.be.fulfilled;
//
//     });
//
//     it('includes original event on the event property of the request', async () => {
//
//         await handler(event, context);
//         const request = method.call.firstCall.args[1];
//
//         expect(request.event).to.equal(event);
//
//     });
//
//     describe('request property passthrough', () => {
//
//         const propChecks = [
//             'headers',
//             'httpMethod',
//             'path',
//             'pathParameters',
//             'queryStringParameters',
//             'requestContext',
//             'resource',
//             'stageVariables',
//         ];
//
//         propChecks.forEach(prop => {
//             it(`includes the ${prop} on the ${prop} property of the request`, async () => {
//
//                 await handler(event, context);
//                 const request = method.call.firstCall.args[1];
//
//                 expect(request[prop]).to.equal(event[prop]);
//
//             });
//         });
//
//     });
//
//     describe('successful requests', () => {
//
//         it('returns a response object with a 200 status code', async () => {
//
//             const result = await handler(event, context);
//
//             expect(result.statusCode).to.equal(200);
//
//         });
//
//         it('returns a response object including CORS headers', async () => {
//
//             const result = await handler(event, context);
//
//             expect(result.headers).to.deep.equal({
//                 [CORS_ALLOW_ORIGIN]:      '*',
//                 [CORS_ALLOW_CREDENTIALS]: true,
//             });
//
//         });
//
//         // tslint:disable max-line-length
//         it('returns a response object including the JSON stringified representation of the method\'s return value', async () => {
//
//             const result = await handler(event, context);
//
//             expect(result.body).to.equal(JSON.stringify(response));
//
//         });
//
//     });
//
//     describe('erroneous requests', () => {
//         let error: any;
//
//         stubConsole([ 'error' ]);
//
//         beforeEach(() => {
//             error = {
//                 message: 'Your llama is lloose',
//                 stack:   '5 llamas',
//
//             };
//             method.call.throws(error);
//         });
//
//         it('catches errors', async () => {
//
//             await expect(handler(event.context)).to.be.fulfilled;
//
//         });
//
//         it('returns a response object with a 500 status code if the status code is not specified by the error', async () => {
//
//             const result = await handler(event, context);
//
//             expect(result.statusCode).to.equal(500);
//
//         });
//
//         it('returns a response object with the status code specified by the error', async () => {
//
//             error.statusCode = 418;
//             const result = await handler(event, context);
//
//             expect(result.statusCode).to.equal(418);
//
//         });
//
//         it('returns a response object including CORS headers', async () => {
//
//             const result = await handler(event, context);
//
//             expect(result.headers).to.deep.equal({
//                 [CORS_ALLOW_ORIGIN]:      '*',
//                 [CORS_ALLOW_CREDENTIALS]: true,
//             });
//
//         });
//
//         // tslint:disable max-line-length
//         it('returns a response object including the JSON stringified representation of the error', async () => {
//
//             const result = await handler(event, context);
//
//             expect(result.body).to.equal(JSON.stringify(error));
//
//         });
//
//     });
//
// });
