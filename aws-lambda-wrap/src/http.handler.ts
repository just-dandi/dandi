// /* eslint no-magic-numbers: ['error', { 'ignore': [200,500] }] */
//
// import { ErrorUtil } from '@dandi/common';
//
// import {
//     APIGatewayEventRequestContext,
//     APIGatewayProxyEvent, APIGatewayProxyResult,
//     Context,
// } from 'aws-lambda';
//
// export interface HttpHandlerRequest<TBody> {
//     body: TBody;
//     rawBody: string;
//     event: APIGatewayProxyEvent;
//     headers: { [name: string]: string };
//     httpMethod: string;
//     path: string;
//     pathParameters: { [name: string]: string } | null;
//     queryStringParameters: { [name: string]: string } | null;
//     stageVariables: { [name: string]: string } | null;
//     requestContext: APIGatewayEventRequestContext;
//     resource: string;
//     context: Context;
// }
//
// export type HttpHandlerMethod = (request: HttpHandlerRequest<any>) => Promise<any>;
//
// export const CORS_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
// export const CORS_ALLOW_CREDENTIALS = 'Access-Control-Allow-Credentials';
//
// /**
//  * Provides basic handling functionality for interfacing between business logic and AWS Lambda
//  */
// export async function httpHandler(
//     method: HttpHandlerMethod,
//     event: APIGatewayProxyEvent,
//     context: Context,
// ): Promise<APIGatewayProxyResult> {
//
//     try {
//
//         let body: any;
//         if (event.body) {
//             let bodyStr = event.body;
//             if (event.isBase64Encoded) {
//                 bodyStr = new Buffer(bodyStr, 'base64').toString('utf-8');
//             }
//             body = JSON.parse(bodyStr);
//         }
//         const request: HttpHandlerRequest<any> = {
//             body,
//             context,
//             event,
//             rawBody:               event.body,
//             headers:               event.headers,
//             httpMethod:            event.httpMethod,
//             path:                  event.path,
//             pathParameters:        event.pathParameters,
//             queryStringParameters: event.queryStringParameters,
//             requestContext:        event.requestContext,
//             resource:              event.resource,
//             stageVariables:        event.stageVariables,
//         };
//
//         /* eslint-disable-next-line no-invalid-this */
//         const result = await method.call(this, request);
//         return {
//             statusCode: 200,
//             headers:    {
//                 [CORS_ALLOW_ORIGIN]:      '*', // Required for CORS support to work
//                 [CORS_ALLOW_CREDENTIALS]: true, // Required for cookies, authorization headers with HTTPS
//             },
//             body: JSON.stringify(result),
//         };
//
//     } catch (err) {
//
//         /* eslint-disable-next-line no-invalid-this */
//         ErrorUtil.logEventError(this.constructor.name, 'error handling APIGatewayProxyEvent', event, err);
//
//         return {
//             statusCode: err.statusCode || 500,
//             headers:    {
//                 [CORS_ALLOW_ORIGIN]:      '*', // Required for CORS support to work
//                 [CORS_ALLOW_CREDENTIALS]: true, // Required for cookies, authorization headers with HTTPS
//             },
//             body: JSON.stringify({
//                 message: err.message,
//                 stack:   err.stack,
//             }),
//         };
//
//     }
//
// }
