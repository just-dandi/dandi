import { GlobalSymbolFn, packageGlobalSymbol } from '@dandi/common'

import { localToken } from './local-token'

export const globalSymbol: GlobalSymbolFn = packageGlobalSymbol.bind(null, localToken.PKG)
