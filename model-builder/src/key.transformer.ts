export type KeyTransformFn = (key: string) => string;

export interface KeyTransformer {
  to<T>(keyTransformFn: KeyTransformFn, obj: any): T;
}
