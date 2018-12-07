import { Inject } from '@dandi/core'
import { Controller, HttpPost, QueryParam } from '@dandi/mvc'

import { ListManager } from '../lists/list.manager'

import { ExampleManager } from './example.manager'

@Controller('/example')
export class ExampleController {
  constructor(
    @Inject(ExampleManager) private exampleManager: ExampleManager,
    @Inject(ListManager) private listManager: ListManager,
  ) {}

  @HttpPost()
  public createExamples(@QueryParam(Number) listCount: number, @QueryParam(Number) tasksPerList): Promise<any> {
    return this.exampleManager.addExamples(listCount, tasksPerList)
  }
}
