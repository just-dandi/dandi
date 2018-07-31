import { HttpEventOptions } from './http.event.options';
import { HttpEventTransformer } from './http.event.transformer';
import { HttpResponder } from './http.responder';

export interface AwsLambdaHttpModule extends Array<any> {
  configure(options: HttpEventOptions): any[];
}

export const AwsLambdaHttpModule: AwsLambdaHttpModule = [
  HttpResponder,
  HttpEventTransformer,
] as any;
Object.defineProperty(AwsLambdaHttpModule, 'configure', {
  value: (options: HttpEventOptions) => {
    return AwsLambdaHttpModule.concat([
      {
        provide: HttpEventOptions,
        useValue: options,
      },
    ]);
  },
  configurable: false,
  writable: false,
});
