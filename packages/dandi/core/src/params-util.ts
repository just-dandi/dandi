import { AppError } from '@dandi/common'

const PATTERNS = {
  ctrOrFunctionSig: /(?:constructor|(?:async\s*)?[fF]unction)\s?(\([\w.=,\s()+[\]]*\))/,
  arrowFnSig: /^(?:async\s*)?(\(?[\w.=,\s]*\)?) =>/,
  methodSig: (name) => new RegExp(`^(?:async\\s*)?${name}(\\(([\\w.=,\\s]*)\\))`),
  params: /\w+/g,
}

const CACHE_KEYS = new Map<Function, Map<string, symbol>>()
const CACHE = new Map<symbol, string[]>()

function getCacheKey(target: Function, memberName?: string): symbol {
  let targetEntry = CACHE_KEYS.get(target)
  if (!targetEntry) {
    targetEntry = new Map<string, symbol>()
    CACHE_KEYS.set(target, targetEntry)
  }
  let keyEntry: symbol = targetEntry.get(memberName)
  if (!keyEntry) {
    keyEntry = Symbol(memberName)
    targetEntry.set(memberName, keyEntry)
  }
  return keyEntry
}

function storeResult(key: symbol, value: string[]): string[] {
  CACHE.set(key, value)
  return value
}

/**
 * Thrown when [[@Inject()]] is used to decorate an unsupported parameter, such as a `rest` parameter.
 */
export class UnsupportedParamTypeError extends AppError {
  constructor(message: string, public readonly target: any) {
    super(message)
  }
}

function selectPattern(str: string): RegExp {
  if (str.startsWith('class') || str.startsWith('function') || str.startsWith('Function')) {
    return PATTERNS.ctrOrFunctionSig
  }
  if (str.indexOf('=>') > 0) {
    return PATTERNS.arrowFnSig
  }
  return PATTERNS.ctrOrFunctionSig
}

/**
 * @internal
 * @ignore
 */
export function getParamNames<T>(target: Function, memberName?: string): string[] {
  if (typeof target !== 'function') {
    throw new Error('Target is not a function')
  }
  const cacheKey = getCacheKey(target, memberName)
  const cachedResult = CACHE.get(cacheKey)
  if (cachedResult) {
    return cachedResult
  }

  // FIXME: this will return the wrong data if there's a comment before the constructor that looks like a constructor signature
  // write a RegExp replace to strip comments?
  const str = target.toString()
  const pattern = memberName ? PATTERNS.methodSig(memberName) : selectPattern(str)
  const sigStrMatch = str.match(pattern)

  // classes with implicit constructors
  if (!sigStrMatch && !memberName && str.startsWith(`class ${target.name} {`)) {
    return storeResult(cacheKey, [])
  }

  const sigStr = sigStrMatch[1]

  if (sigStr.indexOf('...') >= 0) {
    throw new UnsupportedParamTypeError('Rest parameters are not supported', target)
  }
  // if (sigStr.indexOf('=') >= 0) {
  //   throw new UnsupportedParamTypeError('Default values are not supported', target)
  // }

  if (sigStr === '()') {
    return storeResult(cacheKey, [])
  }
  const paramsMatch = sigStr.match(PATTERNS.params)
  return storeResult(cacheKey, paramsMatch)
}
