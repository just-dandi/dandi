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
