import { Constructor } from '@dandi/common'
import { Provider } from '@dandi/core'

import { HttpResponseRenderer } from './http-response-renderer'

export class DefaultHttpResponseRenderer {
  public static use(rendererType: Constructor<HttpResponseRenderer>): [Constructor<HttpResponseRenderer>, Provider<DefaultHttpResponseRenderer>] {
    return [
      rendererType,
      {
        provide: DefaultHttpResponseRenderer,
        useValue: rendererType,
      },
    ]
  }
}
