export interface ControllerResult {
  readonly resultObject: object;
  readonly contentType: string;
  readonly headers?: { [key: string]: string };
  readonly value: string;
}

export function isControllerResult(obj: any): obj is ControllerResult {
  return obj && typeof obj.value !== 'undefined' && typeof obj.contentType === 'string';
}
