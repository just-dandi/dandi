function isObject(obj: any): obj is Object {
  return typeof obj === 'object'
}

function walkCaseEntry(caseKeysFn: (str: string) => string, obj: any): any {
  if (typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    if (!obj.length) {
      return obj
    }
    return mapKeys(caseKeysFn, obj)
  }

  return caseKeysFn(obj)
}

export function mapKeys(caseFn: (str: string) => string, obj: any): any {
  const caseKeysFn = mapKeys.bind(null, caseFn)
  if (Array.isArray(obj)) {
    return obj.map(caseKeysFn)
  }
  if (obj === null || !isObject(obj) || obj.constructor !== Object) {
    return obj
  }
  const result: any = {}
  Object.keys(obj).forEach((key: string) => {
    let value = obj[key]
    value = walkCaseEntry(caseKeysFn, value)
    key = caseFn(key)
    result[key] = value
  })
  return result
}
