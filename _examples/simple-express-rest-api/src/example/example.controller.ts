import { Inject } from '@dandi/core'
import { QueryParam } from '@dandi/http-model'
import { Controller, HttpGet, HttpPost } from '@dandi/mvc'

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

  @HttpGet('throw')
  public throw(): void {
    throw new Error('oh no!')
  }
}
