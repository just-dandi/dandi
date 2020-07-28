import { localTokenFactory } from '@dandi/core'

import { name as PACKAGE_NAME } from '../package.json'

export const localToken = localTokenFactory(PACKAGE_NAME)
