export interface LoggerMethodModifiers {
  readonly level: LoggerMethod
  readonly noLevel: LoggerMethod
  readonly timestamp: LoggerMethod
  readonly noTimestamp: LoggerMethod
  readonly context: LoggerMethod
  readonly noContext: LoggerMethod
  readonly noTags: LoggerMethod
}

/**
 * A language chain of [[LoggerMethodModifiers]] that gives the caller a fluent interface for defining the
 * [[LogCallOptions]] of a [[LogEntry]].
 *
 * ```typescript
 * this.logger.info.noContext(`Context doesn't really matter anyway`)
 * ```
 */
export interface LoggerMethod extends LoggerMethodModifiers, Function {
  (...args: any[]): void
}

/**
 * Options for customizing the display of a [[LogEntry]]
 */
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

/**
 * @internal
 * @ignored
 */
export const MODIFIER_KEYS = Object.keys(LOGGER_METHOD_CONFIG)

/**
 * @internal
 * @ignored
 */
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

