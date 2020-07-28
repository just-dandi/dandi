import { localTokenFactory } from '@dandi/core'

import { PACKAGE_NAME } from './package'

export const localToken = localTokenFactory(PACKAGE_NAME)
