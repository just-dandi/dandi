export interface ControllerResult {
  readonly data: object
  readonly headers?: { [key: string]: string }
}

export function isControllerResult(obj: any): obj is ControllerResult {
  return obj && typeof obj.data !== 'undefined'
}
