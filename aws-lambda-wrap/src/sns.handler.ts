import { ErrorUtil } from '@dandi/common';

import { SNSEvent } from 'aws-lambda';

export type SnsHandlerMethod = (event: SNSEvent) => Promise<any>;

/**
 * Provides basic handling functionality for interfacing between business logic and AWS Lambda
 */
export async function snsHandler(
    method: SnsHandlerMethod,
    event: SNSEvent,
): Promise<any> {

    try {

        await Promise.all(event.Records.map(record => {
            const msgStr = record.Sns.Message;
            const msg = JSON.parse(msgStr);
            /* eslint-disable-next-line no-invalid-this */
            return method.call(this, msg);
        }));

    } catch (err) {

        /* eslint-disable-next-line no-invalid-this */
        ErrorUtil.logEventError(this.constructor.name, 'error handling APIGatewayProxyEvent', event, err);

    }

}
