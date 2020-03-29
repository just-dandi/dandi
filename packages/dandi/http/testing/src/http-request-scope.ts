import { createHttpRequestScope, HttpRequestScopeInstance } from '@dandi/http'

export function createTestHttpRequestScope(): HttpRequestScopeInstance {
  return createHttpRequestScope('test', 'test')
}
