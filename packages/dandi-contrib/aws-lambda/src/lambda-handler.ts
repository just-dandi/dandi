export interface LambdaHandler {
  handleEvent<TResult, TReturn>(...args: any[]): any | Promise<any>
}
