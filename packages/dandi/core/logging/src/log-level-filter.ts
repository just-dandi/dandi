let level = 0
const LOG_LEVEL_ERROR = level++
const LOG_LEVEL_WARN = level++
const LOG_LEVEL_INFO = level++
const LOG_LEVEL_DEBUG = level++

export enum LogLevelValue {
  error = 1 << LOG_LEVEL_ERROR,
  warn = 1 << LOG_LEVEL_WARN,
  info = 1 << LOG_LEVEL_INFO,
  debug = 1 << LOG_LEVEL_DEBUG,
}

export enum LogLevelFilter {
  error = ~(~1 << LOG_LEVEL_ERROR),
  warn = ~(~1 << LOG_LEVEL_WARN),
  info = ~(~1 << LOG_LEVEL_INFO),
  debug = ~(~1 << LOG_LEVEL_DEBUG),
}
