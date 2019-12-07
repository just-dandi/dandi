export interface LambdaHandler {
  handleEvent<TResult>(...args: any[]): any | Promise<any>
}
