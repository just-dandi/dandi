import { PUG_DEFAULT_OPTIONS } from './pug-default-options';
import { PugOptions } from './pug-options';
import { PugViewEngine } from './pug-view-engine';

export interface MvcViewPugModule extends Array<any> {
  config(options: PugOptions);
}

export const MvcViewPugModule: MvcViewPugModule = [
  PugViewEngine,
] as any;

Object.defineProperty(MvcViewPugModule, 'config', {
  value: function config(options: PugOptions) {
    return this.concat([
      {
        provide: PugOptions,
        useValue: Object.assign({}, PUG_DEFAULT_OPTIONS, options),
      },
    ]);
  },
});
