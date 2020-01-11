import { createSandbox } from 'sinon'

const sandbox = createSandbox()

export const { createStubInstance, restore, spy, stub } = sandbox
