import { createSandbox } from 'sinon'

const sandbox = createSandbox()

beforeEach(function () {
  // eslint-disable-next-line no-invalid-this
  this.sandbox = sandbox
})
afterEach(function () {
  sandbox.restore()
})
