export interface LoggerMethodModifiers {
  readonly level: LoggerMethod
  readonly noLevel: LoggerMethod
  readonly timestamp: LoggerMethod
  readonly noTimestamp: LoggerMethod
  readonly context: LoggerMethod
  readonly noContext: LoggerMethod
  readonly noTags: LoggerMethod
}

export interface LoggerMethod extends LoggerMethodModifiers, Function {
  (...args: any[]): void
}

export interface LogCallOptions {
  level?: boolean
  timestamp?: boolean
  context?: boolean
}

interface LoggerMethodConfig {
  value: boolean
  props: (keyof LogCallOptions)[]
}

function loggerMethodConfig(value: boolean, ...props: (keyof LogCallOptions)[]): LoggerMethodConfig {
  return {
    value,
    props,
  }
}

const LOGGER_METHOD_CONFIG: { [TKey in keyof LoggerMethodModifiers]: LoggerMethodConfig } = {
  level: loggerMethodConfig(true, 'level'),
  noLevel: loggerMethodConfig(false, 'level'),
  timestamp: loggerMethodConfig(true, 'timestamp'),
  noTimestamp: loggerMethodConfig(false, 'timestamp'),
  context: loggerMethodConfig(true, 'context'),
  noContext: loggerMethodConfig(false, 'context'),
  noTags: loggerMethodConfig(false, 'context', 'level', 'timestamp'),
}
export const MODIFIER_KEYS = Object.keys(LOGGER_METHOD_CONFIG)

export function createLoggerMethodChain(logAction: (options: LogCallOptions, ...args: any[]) => void): LoggerMethod {
  const options: LogCallOptions = {}
  const chain: LoggerMethod = logAction.bind(null, options)
  MODIFIER_KEYS.forEach(key => {
    const config = LOGGER_METHOD_CONFIG[key]
    Object.defineProperty(chain, key, {
      get: setOption.bind(null, config),
    })
  })
  function setOption(config: LoggerMethodConfig): LoggerMethod {
    config.props.forEach(prop => options[prop] = config.value)
    return chain
  }
  return chain
}

