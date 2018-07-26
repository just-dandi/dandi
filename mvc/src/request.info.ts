import { Uuid }           from '@dandi/common';
import { InjectionToken } from '@dandi/core';

import { localOpinionatedToken } from './local.token';
import { PerfRecorder }          from './perf.recorder';

export interface RequestInfo {
    requestId: Uuid;
    performance: PerfRecorder;
}

export const RequestInfo: InjectionToken<RequestInfo> =
    localOpinionatedToken<RequestInfo>('RequestInfo', { multi: false });
