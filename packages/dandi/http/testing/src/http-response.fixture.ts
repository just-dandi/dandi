import { createStubObject } from '@dandi/core/testing'
import { HttpResponse } from '@dandi/http'

import { SinonStubbedInstance } from 'sinon'

const PROPS: (keyof HttpResponse)[] = [
  'cookie',
  'contentType',
  'end',
  'header',
  'json',
  'redirect',
  'send',
  'set',
  'setHeader',
  'status',
]

export function httpResponseFixture(): SinonStubbedInstance<HttpResponse> {
  const instance = createStubObject<HttpResponse>(...PROPS)
  PROPS.forEach(prop => instance[prop].returnsThis())
  return instance
}
