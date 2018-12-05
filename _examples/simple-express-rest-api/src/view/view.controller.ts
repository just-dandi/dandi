import { Inject } from '@dandi/core';
import { Controller, HttpGet, RequestQueryParamMap } from '@dandi/mvc';
import { View } from '@dandi/mvc-view';

@Controller('view')
export class ViewController {
  @HttpGet('pug')
  @View('view.pug')
  public pug(@Inject(RequestQueryParamMap) query) {
    return { query };
  }
}
