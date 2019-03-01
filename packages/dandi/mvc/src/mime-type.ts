import { MimeTypeInfo } from './mime-type-info'

const ORIGINAL_INDEX = Symbol.for('MimeTypeInfo:originalIndex')

export function parseMimeTypes(...acceptHeaders: string[]): MimeTypeInfo[] {
  return acceptHeaders
    .join(',')
    .split(',')
    .map((source, originalIndex) => {
      source = source.trim()

      // get the type - the "application" in "application/json"
      const typeSeparatorIndex = source.indexOf('/')
      const type = source.substring(0, typeSeparatorIndex)

      // determine where any metadata starts - the ";" in "application/json; q=0.5"
      const metaSeparatorIndex = source.indexOf(';')

      // parse out the subtype - the "json" in "application/json"
      const subtype = source.substring(typeSeparatorIndex + 1, metaSeparatorIndex < 0 ? undefined : metaSeparatorIndex)

      // parse out any "base" subtype - the "xml" in "application/xhtml+xml"
      const subtypeBaseSeparatorIndex = subtype.indexOf('+')
      const subtypeBase = subtypeBaseSeparatorIndex > 0 ? subtype.substring(subtypeBaseSeparatorIndex + 1) : undefined
      const metaStr = metaSeparatorIndex > 0 ? source.substring(metaSeparatorIndex + 1) : undefined

      // determine the "quality" weight - the "0.5" in "application/json; q=0.5"
      let weight = 1
      if (metaStr) {
        const weightMatch = metaStr.match(/q=(\d+\.\d+)/)
        if (weightMatch) {
          weight = parseFloat(weightMatch[1])
        }
      }

      const fullType = `${type}/${subtype}`

      const info = {
        type,
        subtype,
        subtypeBase,
        fullType,
        weight,
        source,
      }
      info[ORIGINAL_INDEX] = originalIndex
      return info
    })
    .sort((a: MimeTypeInfo, b: MimeTypeInfo) => {
      if (a.weight === b.weight) {
        return a[ORIGINAL_INDEX] - b[ORIGINAL_INDEX]
      }
      return b.weight - a.weight
    })
}

export function isRenderableMimeType(acceptType: MimeTypeInfo, renderableType: MimeTypeInfo): boolean {
  const matchesType = acceptType.type === '*' || acceptType.type === renderableType.type
  const matchesSubtype = acceptType.subtype === '*' || acceptType.subtype === renderableType.subtype
  return matchesType && matchesSubtype
}
